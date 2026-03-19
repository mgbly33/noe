'use client';

type DrawStageProps = {
  step: string;
  error: string;
  onRetry: () => void;
};

const steps = ['锁定权益', '抽取牌面', '生成解读', '整理结果'];

export function DrawStage({ step, error, onRetry }: DrawStageProps) {
  return (
    <div className="panel-card">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Reading Pipeline</p>
          <h2>正在完成这次抽牌仪式</h2>
        </div>
        <span className="status-pill">{step}</span>
      </div>

      <div className="progress-stack">
        {steps.map((item) => (
          <div
            key={item}
            className={item === step ? 'progress-row active' : 'progress-row'}
          >
            <span className="progress-dot" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      {error ? (
        <>
          <p className="error-text">{error}</p>
          <button type="button" className="secondary-button" onClick={onRetry}>
            重试
          </button>
        </>
      ) : (
        <p className="muted-text">
          系统会在服务端锁定额度、抽牌、生成结构化结果，然后自动跳转到结果页。
        </p>
      )}
    </div>
  );
}
