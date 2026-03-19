'use client';

type MockCheckoutProps = {
  title: string;
  price: number;
  orderId: string;
  pending: boolean;
  onPay: () => void;
};

export function MockCheckout({
  title,
  price,
  orderId,
  pending,
  onPay,
}: MockCheckoutProps) {
  return (
    <div className="panel-card">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Mock Checkout</p>
          <h2>{title}</h2>
        </div>
        <span className="price-chip">¥ {price.toFixed(2)}</span>
      </div>

      <dl className="summary-grid">
        <div>
          <dt>订单号</dt>
          <dd>{orderId}</dd>
        </div>
        <div>
          <dt>支付方式</dt>
          <dd>Mock Pay</dd>
        </div>
      </dl>

      <button
        type="button"
        className="primary-button"
        data-testid="mock-pay-submit"
        onClick={onPay}
        disabled={pending}
      >
        {pending ? '确认支付中...' : '确认并完成支付'}
      </button>
    </div>
  );
}
