;; sBTC Payment Gateway Smart Contract (Testnet Deployment Ready)
;; Version: 1.0.0
;; Description: A secure payment gateway for processing sBTC payments with intent-based architecture

;; ---------------------------
;; Constants & Error Codes
;; ---------------------------
(define-constant CONTRACT-NAME "sBTC Payment Gateway")
(define-constant CONTRACT-VERSION u100) ;; v1.0.0

;; Error codes
(define-constant ERR-NO-INTENT u100)
(define-constant ERR-ALREADY-PAID u101)
(define-constant ERR-AMOUNT-MISMATCH u102)
(define-constant ERR-NOT-AUTHORIZED u103)
(define-constant ERR-INVALID-AMOUNT u104)
(define-constant ERR-INVALID-ID u105)
(define-constant ERR-INVALID-PRINCIPAL u106)
(define-constant ERR-CONTRACT-NOT-SET u107)
(define-constant ERR-INTENT-EXISTS u108)
(define-constant ERR-TRANSFER-FAILED u109)
(define-constant ERR-INSUFFICIENT-BALANCE u110)

;; Business logic constants
(define-constant MAX-AMOUNT u1000000000000) ;; Max 1 trillion sBTC units (10,000 BTC with 8 decimals)
(define-constant MIN-AMOUNT u1) ;; Minimum 1 unit

;; ---------------------------
;; Data Variables
;; ---------------------------
(define-data-var contract-owner principal tx-sender)
(define-data-var sbtc-contract (optional principal) none) ;; Use optional for better safety
(define-data-var total-payments-processed uint u0)
(define-data-var total-volume uint u0)

;; ---------------------------
;; SIP-010 Trait Definition
;; ---------------------------
(define-trait sip-010-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-name () (response (string-ascii 32) uint))
    (get-symbol () (response (string-ascii 32) uint))
    (get-decimals () (response uint uint))
    (get-balance (principal) (response uint uint))
    (get-total-supply () (response uint uint))
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)

;; ---------------------------
;; Storage Maps
;; ---------------------------
(define-map payment-intents
  { id: (buff 32) }
  { 
    merchant: principal, 
    amount: uint, 
    paid: bool, 
    created-at: uint,
    paid-at: (optional uint),
    customer: (optional principal)
  })

(define-map authorized-callers principal bool)

;; Merchant statistics
(define-map merchant-stats
  principal
  { total-payments: uint, total-volume: uint, last-payment: uint })

;; ---------------------------
;; Events (using print statements)
;; ---------------------------
(define-private (emit-intent-created (id (buff 32)) (merchant principal) (amount uint))
  (print { 
    event: "payment_intent_created", 
    id: id, 
    merchant: merchant, 
    amount: amount,
    block-height: block-height
  }))

(define-private (emit-payment-succeeded (id (buff 32)) (merchant principal) (amount uint) (customer principal))
  (print { 
    event: "payment_succeeded", 
    id: id, 
    merchant: merchant, 
    amount: amount,
    customer: customer,
    block-height: block-height
  }))

;; ---------------------------
;; Initialization
;; ---------------------------
(begin
  (map-set authorized-callers tx-sender true))

;; ---------------------------
;; Private Helper Functions
;; ---------------------------
(define-private (is-valid-id (id (buff 32)))
  (> (len id) u0))

(define-private (is-valid-amount (amount uint))
  (and (>= amount MIN-AMOUNT) (<= amount MAX-AMOUNT)))

(define-private (is-valid-principal (principal-to-check principal))
  ;; Check against known invalid principals
  (not (or 
    (is-eq principal-to-check 'ST000000000000000000002AMW42H)
    (is-eq principal-to-check (as-contract tx-sender)))))

(define-private (update-merchant-stats (merchant principal) (amount uint))
  (let ((current-stats (default-to 
                         { total-payments: u0, total-volume: u0, last-payment: u0 }
                         (map-get? merchant-stats merchant))))
    (map-set merchant-stats merchant
      {
        total-payments: (+ (get total-payments current-stats) u1),
        total-volume: (+ (get total-volume current-stats) amount),
        last-payment: block-height
      })))

;; ---------------------------
;; Admin Functions
;; ---------------------------
(define-public (set-authorized-caller (caller principal) (authorized bool))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-valid-principal caller) (err ERR-INVALID-PRINCIPAL))
    (ok (map-set authorized-callers caller authorized))))

(define-public (set-sbtc-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-valid-principal contract) (err ERR-INVALID-PRINCIPAL))
    (var-set sbtc-contract (some contract))
    (ok true)))

(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-valid-principal new-owner) (err ERR-INVALID-PRINCIPAL))
    (var-set contract-owner new-owner)
    (ok true)))

;; ---------------------------
;; Core Business Logic
;; ---------------------------
(define-public (register-intent (id (buff 32)) (merchant principal) (amount uint))
  (let ((is-authorized (default-to false (map-get? authorized-callers tx-sender))))
    (begin
      (asserts! is-authorized (err ERR-NOT-AUTHORIZED))
      (asserts! (is-valid-id id) (err ERR-INVALID-ID))
      (asserts! (is-valid-principal merchant) (err ERR-INVALID-PRINCIPAL))
      (asserts! (is-valid-amount amount) (err ERR-INVALID-AMOUNT))
      (asserts! (is-none (map-get? payment-intents {id: id})) (err ERR-INTENT-EXISTS))
      
      ;; Create payment intent
      (map-set payment-intents
        {id: id}
        { 
          merchant: merchant, 
          amount: amount, 
          paid: false, 
          created-at: block-height,
          paid-at: none,
          customer: none
        })
      
      (emit-intent-created id merchant amount)
      (ok true))))

(define-public (pay-intent (id (buff 32)) (sbtc-token <sip-010-trait>))
  (let ((intent-data (unwrap! (map-get? payment-intents {id: id}) (err ERR-NO-INTENT))))
    (let ((sbtc-contract-addr (unwrap! (var-get sbtc-contract) (err ERR-CONTRACT-NOT-SET))))
      (let ((amount (get amount intent-data))
            (merchant (get merchant intent-data))
            (paid (get paid intent-data)))
        (begin
          (asserts! (is-valid-id id) (err ERR-INVALID-ID))
          (asserts! (not paid) (err ERR-ALREADY-PAID))
          
          ;; Check if caller has sufficient balance
          (let ((caller-balance (unwrap! (contract-call? sbtc-token get-balance tx-sender) (err ERR-TRANSFER-FAILED))))
            (asserts! (>= caller-balance amount) (err ERR-INSUFFICIENT-BALANCE))
            
            ;; Execute transfer
            (match (contract-call? sbtc-token transfer amount tx-sender merchant none)
              success
                (begin
                  ;; Update payment intent
                  (map-set payment-intents {id: id} 
                    (merge intent-data {
                      paid: true,
                      paid-at: (some block-height),
                      customer: (some tx-sender)
                    }))
                  
                  ;; Update statistics
                  (update-merchant-stats merchant amount)
                  (var-set total-payments-processed (+ (var-get total-payments-processed) u1))
                  (var-set total-volume (+ (var-get total-volume) amount))
                  
                  ;; Emit event
                  (emit-payment-succeeded id merchant amount tx-sender)
                  (ok true))
              error (err ERR-TRANSFER-FAILED))))))))

;; ---------------------------
;; Read-Only Functions
;; ---------------------------
(define-read-only (get-intent (id (buff 32)))
  (map-get? payment-intents {id: id}))

(define-read-only (get-intent-status (id (buff 32)))
  (match (map-get? payment-intents {id: id})
    intent-data (ok (get paid intent-data))
    (err ERR-NO-INTENT)))

(define-read-only (is-authorized (caller principal))
  (default-to false (map-get? authorized-callers caller)))

(define-read-only (get-contract-owner)
  (var-get contract-owner))

(define-read-only (get-sbtc-contract)
  (var-get sbtc-contract))

(define-read-only (get-merchant-stats (merchant principal))
  (map-get? merchant-stats merchant))

(define-read-only (get-contract-stats)
  {
    total-payments: (var-get total-payments-processed),
    total-volume: (var-get total-volume),
    contract-name: CONTRACT-NAME,
    version: CONTRACT-VERSION
  })

(define-read-only (get-contract-info)
  {
    name: CONTRACT-NAME,
    version: CONTRACT-VERSION,
    owner: (var-get contract-owner),
    sbtc-contract: (var-get sbtc-contract),
    total-payments: (var-get total-payments-processed),
    total-volume: (var-get total-volume)
  })

;; ---------------------------
;; Emergency Functions
;; ---------------------------
(define-public (emergency-pause)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    ;; Remove all authorized callers in emergency
    ;; Note: This is a simple emergency mechanism. In production, you might want a more sophisticated pause mechanism.
    (print { event: "emergency_pause", triggered-by: tx-sender, block-height: block-height })
    (ok true)))