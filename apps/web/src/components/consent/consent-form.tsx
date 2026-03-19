'use client';

type ConsentFormProps = {
  checked: boolean;
  disabled?: boolean;
  versions: {
    privacy_version: string;
    disclaimer_version: string;
    ai_notice_version: string;
    age_notice_version: string;
  } | null;
  error: string;
  onCheckedChange: (value: boolean) => void;
  onSubmit: () => void;
};

const protocolItems = [
  { key: 'privacy_version', label: '隐私说明' },
  { key: 'disclaimer_version', label: '结果边界' },
  { key: 'ai_notice_version', label: 'AI 提示' },
  { key: 'age_notice_version', label: '年龄确认' },
] as const;

export function ConsentForm({
  checked,
  disabled,
  versions,
  error,
  onCheckedChange,
  onSubmit,
}: ConsentFormProps) {
  return (
    <div className="panel-card form-panel">
      <div className="panel-head panel-head-start">
        <div>
          <p className="eyebrow">Threshold</p>
          <h2>开始前，先确认这次解读的边界</h2>
        </div>
        {versions ? (
          <span className="status-pill">版本 {versions.disclaimer_version}</span>
        ) : null}
      </div>

      <p className="muted-text">
        本次结果仅用于自我观察与整理，不替代医疗、法律、财务或任何紧急支持。若你正在经历强烈危险，请先回到现实中的帮助网络。
      </p>

      <div className="protocol-grid">
        {protocolItems.map((item) => (
          <div key={item.key} className="protocol-card">
            <strong>{item.label}</strong>
            <span>{versions?.[item.key] ?? '加载中…'}</span>
          </div>
        ))}
      </div>

      <label className="checkbox-row">
        <input
          data-testid="consent-checkbox"
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        <span>
          我已阅读并理解以上说明，知晓本次解读仅作为自我反思参考，并同意继续进入提问阶段。
        </span>
      </label>

      {error ? <p className="error-text">{error}</p> : null}

      <button
        type="button"
        className="primary-button"
        data-testid="continue-button"
        onClick={onSubmit}
        disabled={!checked || disabled}
      >
        {disabled ? '正在确认…' : '继续整理问题'}
      </button>
    </div>
  );
}
