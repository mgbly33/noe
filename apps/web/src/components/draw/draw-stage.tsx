'use client';

type DrawStageProps = {
  step: string;
  error: string;
  onRetry: () => void;
};

const steps = ['确认权益', '展开牌阵', '生成回应', '整理结果'];

export function DrawStage({ step, error, onRetry }: DrawStageProps) {
  const activeIndex = steps.findIndex((item) => item === step);

  return (
    <div className="panel-card form-panel">
      <div className="panel-head panel-head-start">
        <div>
          <p className="eyebrow">Ceremony In Motion</p>
          <h2>牌阵正在缓慢展开</h2>
        </div>
        <span className="status-pill">{step}</span>
      </div>

      <div className="draw-preview-grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={index <= activeIndex ? 'draw-preview-card active' : 'draw-preview-card'}>
            <span>{`0${index + 1}`}</span>
          </div>
        ))}
      </div>

      <div className="progress-stack">
        {steps.map((item, index) => {
          const state =
            index < activeIndex
              ? 'done'
              : index === activeIndex
                ? 'active'
                : 'upcoming';

          return (
            <div key={item} className={`progress-row progress-row-${state}`}>
              <span className="progress-dot" />
              <span>{item}</span>
            </div>
          );
        })}
      </div>

      {error ? (
        <>
          <p className="error-text">{error}</p>
          <button type="button" className="secondary-button" onClick={onRetry}>
            重新开始这一阶段
          </button>
        </>
      ) : (
        <p className="muted-text">
          系统会依次锁定权益、抽取牌面、生成结构化结果，然后自动跳转到结果页。
        </p>
      )}
    </div>
  );
}
