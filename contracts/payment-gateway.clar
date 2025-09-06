;; sBTC Payment Gateway - Original Contract
;; Simplified for successful deployment

;; Error constants
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_AMOUNT (err u101))
(define-constant ERR_PAYMENT_NOT_FOUND (err u102))
(define-constant ERR_ALREADY_PROCESSED (err u103))
(define-constant ERR_INSUFFICIENT_BALANCE (err u104))
(define-constant ERR_INVALID_REFERENCE (err u105))

;; Contract owner
(define-constant CONTRACT_OWNER tx-sender)

;; Data variables
(define-data-var payment-counter uint u0)
(define-data-var total-volume uint u0)

;; Payment structure
(define-map payments
  uint
  {
    merchant: principal,
    customer: principal,
    amount: uint,
    status: (string-ascii 20),
    timestamp: uint,
    reference: (string-ascii 50)
  }
)

;; Merchant balances
(define-map merchant-balances principal uint)

;; Merchant registration
(define-map registered-merchants principal bool)

;; Events
(define-data-var last-payment-id uint u0)

;; Public functions

;; Register as merchant
(define-public (register-merchant)
  (begin
    (map-set registered-merchants tx-sender true)
    (map-set merchant-balances tx-sender u0)
    (ok true)
  )
)

;; Process payment
(define-public (process-payment (merchant principal) (amount uint) (reference (string-ascii 50)))
  (let
    (
      (payment-id (+ (var-get payment-counter) u1))
      (current-time block-height)
    )
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (default-to false (map-get? registered-merchants merchant)) ERR_UNAUTHORIZED)
    (asserts! (> (len reference) u0) ERR_INVALID_REFERENCE)
    
    ;; Store payment record
    (map-set payments payment-id {
      merchant: merchant,
      customer: tx-sender,
      amount: amount,
      status: "completed",
      timestamp: current-time,
      reference: reference
    })
    
    ;; Update merchant balance
    (let ((current-balance (default-to u0 (map-get? merchant-balances merchant))))
      (map-set merchant-balances merchant (+ current-balance amount))
    )
    
    ;; Update counters
    (var-set payment-counter payment-id)
    (var-set total-volume (+ (var-get total-volume) amount))
    (var-set last-payment-id payment-id)
    
    (ok payment-id)
  )
)

;; Withdraw merchant balance
(define-public (withdraw-balance (amount uint))
  (let
    (
      (current-balance (default-to u0 (map-get? merchant-balances tx-sender)))
    )
    (asserts! (>= current-balance amount) ERR_INSUFFICIENT_BALANCE)
    (asserts! (default-to false (map-get? registered-merchants tx-sender)) ERR_UNAUTHORIZED)
    
    ;; Update merchant balance
    (map-set merchant-balances tx-sender (- current-balance amount))
    (ok true)
  )
)

;; Read-only functions

;; Get payment details
(define-read-only (get-payment (payment-id uint))
  (map-get? payments payment-id)
)

;; Get merchant balance
(define-read-only (get-merchant-balance (merchant principal))
  (default-to u0 (map-get? merchant-balances merchant))
)

;; Check if merchant is registered
(define-read-only (is-registered-merchant (merchant principal))
  (default-to false (map-get? registered-merchants merchant))
)

;; Get total payment volume
(define-read-only (get-total-volume)
  (var-get total-volume)
)

;; Get payment counter
(define-read-only (get-payment-count)
  (var-get payment-counter)
)

;; Get last payment ID
(define-read-only (get-last-payment-id)
  (var-get last-payment-id)
)