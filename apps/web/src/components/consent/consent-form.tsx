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

export function ConsentForm({
  checked,
  disabled,
  versions,
  error,
  onCheckedChange,
  onSubmit,
}: ConsentFormProps) {
  return (
    <div className="panel-card">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Consent Gate</p>
          <h2>继续之前，请确认四项声明。</h2>
        </div>
        {versions ? (
          <span className="status-pill">当前版本 {versions.disclaimer_version}</span>
        ) : null}
      </div>

      <div className="protocol-grid">
        <div className="protocol-card">
          <strong>隐私</strong>
          <span>{versions?.privacy_version ?? '加载中'}</span>
        </div>
        <div className="protocol-card">
          <strong>免责声明</strong>
          <span>{versions?.disclaimer_version ?? '加载中'}</span>
        </div>
        <div className="protocol-card">
          <strong>AI 提示</strong>
          <span>{versions?.ai_notice_version ?? '加载中'}</span>
        </div>
        <div className="protocol-card">
          <strong>年龄确认</strong>
          <span>{versions?.age_notice_version ?? '加载中'}</span>
        </div>
      </div>

      <label className="checkbox-row">
        <input
          data-testid="consent-checkbox"
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        <span>我已阅读并同意以上条款，并理解结果仅供自我反思参考。</span>
      </label>

      {error ? <p className="error-text">{error}</p> : null}

      <button
        type="button"
        className="primary-button"
        data-testid="continue-button"
        onClick={onSubmit}
        disabled={!checked || disabled}
      >
        {disabled ? '提交中...' : '继续提问'}
      </button>
    </div>
  );
}
