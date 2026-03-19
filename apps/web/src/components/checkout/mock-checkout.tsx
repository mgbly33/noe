'use client';

type MockCheckoutProps = {
  title: string;
  price: number;
  orderId: string;
  pending: boolean;
  themeLabel: string;
  questionText?: string;
  onPay: () => void;
};

export function MockCheckout({
  title,
  price,
  orderId,
  pending,
  themeLabel,
  questionText,
  onPay,
}: MockCheckoutProps) {
  return (
    <div className="panel-card form-panel">
      <div className="panel-head panel-head-start">
        <div>
          <p className="eyebrow">Ritual Confirmation</p>
          <h2>{title}</h2>
        </div>
        <span className="price-chip">¥ {price.toFixed(2)}</span>
      </div>

      <p className="muted-text">
        你即将确认本次解读。支付完成后，系统会为你锁定权益并开始生成对应的牌阵与结果。
      </p>

      <dl className="summary-grid summary-grid-stack">
        <div>
          <dt>本次主题</dt>
          <dd>{themeLabel}</dd>
        </div>
        <div>
          <dt>订单编号</dt>
          <dd>{orderId}</dd>
        </div>
        <div>
          <dt>支付方式</dt>
          <dd>Mock Pay</dd>
        </div>
      </dl>

      {questionText ? (
        <div className="quote-card">
          <strong>本次想问的问题</strong>
          <p>{questionText}</p>
        </div>
      ) : null}

      <button
        type="button"
        className="primary-button"
        data-testid="mock-pay-submit"
        onClick={onPay}
        disabled={pending}
      >
        {pending ? '正在确认支付…' : '确认并开始这次解读'}
      </button>
    </div>
  );
}
