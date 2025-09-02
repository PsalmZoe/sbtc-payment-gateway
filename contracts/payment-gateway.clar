;; sBTC Payment Gateway Smart Contract
;; Minimal "Payment Intents" registry for atomic sBTC transfers

(define-constant ERR-NO-INTENT u100)
(define-constant ERR-ALREADY-PAID u101)
(define-constant ERR-AMOUNT-MISMATCH u102)
(define-constant ERR-NOT-AUTHORIZED u103)
(define-constant ERR-INVALID-AMOUNT u104)
;; Added new error constants for input validation
(define-constant ERR-INVALID-ID u105)
(define-constant ERR-INVALID-PRINCIPAL u106)

;; Contract owner (your backend's principal)
(define-data-var contract-owner principal tx-sender)

;; Define SIP-010 trait for sBTC token compatibility
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

;; Payment intents storage
(define-map payment-intents
  { id: (buff 32) }
  { 
    merchant: principal, 
    amount: uint, 
    paid: bool,
    created-at: uint
  })

;; Authorized backend principals (can register intents)
(define-map authorized-callers principal bool)

;; Initialize contract owner as authorized
(map-set authorized-callers tx-sender true)

;; Added input validation helper functions
(define-private (is-valid-id (id (buff 32)))
  (> (len id) u0))

(define-private (is-valid-amount (amount uint))
  (and (> amount u0) (< amount u1000000000000))) ;; Max 1 trillion units

;; Admin functions
(define-public (set-authorized-caller (caller principal) (authorized bool))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    ;; Added validation for caller parameter
    (asserts! (not (is-eq caller 'SP000000000000000000002Q6VF78)) (err ERR-INVALID-PRINCIPAL))
    (ok (map-set authorized-callers caller authorized))))

;; Register a new payment intent (called by authorized backend)
(define-public (register-intent (id (buff 32)) (merchant principal) (amount uint))
  (begin
    (asserts! (default-to false (map-get? authorized-callers tx-sender)) (err ERR-NOT-AUTHORIZED))
    ;; Added comprehensive input validation
    (asserts! (is-valid-id id) (err ERR-INVALID-ID))
    (asserts! (not (is-eq merchant 'SP000000000000000000002Q6VF78)) (err ERR-INVALID-PRINCIPAL))
    (asserts! (is-valid-amount amount) (err ERR-INVALID-AMOUNT))
    (asserts! (is-none (map-get? payment-intents {id: id})) (err u409))
    (map-set payment-intents 
      {id: id} 
      {
        merchant: merchant, 
        amount: amount, 
        paid: false,
        created-at: block-height
      })
    (print {
      event: "payment_intent_created",
      id: id,
      merchant: merchant,
      amount: amount
    })
    (ok true)))

;; Updated pay-intent to use trait-based approach for better testnet compatibility
(define-public (pay-intent (id (buff 32)) (sbtc-contract <sip-010-trait>))
  (let
    (
      (intent-data (unwrap! (map-get? payment-intents {id: id}) (err ERR-NO-INTENT)))
      (merchant (get merchant intent-data))
      (amount (get amount intent-data))
      (paid (get paid intent-data))
    )
    (begin
      ;; Added input validation for id parameter
      (asserts! (is-valid-id id) (err ERR-INVALID-ID))
      (asserts! (is-eq paid false) (err ERR-ALREADY-PAID))
      ;; Transfer sBTC from customer to merchant using trait
      (match (contract-call? sbtc-contract transfer amount tx-sender merchant none)
        success
          (begin
            (map-set payment-intents 
              {id: id} 
              (merge intent-data {paid: true}))
            (print {
              event: "payment_intent_succeeded",
              id: id,
              amount: amount,
              merchant: merchant,
              customer: tx-sender
            })
            (ok true))
        error (err u500)))))

;; Read-only functions
(define-read-only (get-intent (id (buff 32)))
  (begin
    ;; Added validation for read-only function
    (asserts! (is-valid-id id) none)
    (map-get? payment-intents {id: id})))

(define-read-only (is-authorized (caller principal))
  (default-to false (map-get? authorized-callers caller)))
