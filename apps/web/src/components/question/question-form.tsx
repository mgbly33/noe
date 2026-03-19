'use client';

type QuestionFormProps = {
  question: string;
  topic: string;
  pending: boolean;
  blocked: boolean;
  error: string;
  onQuestionChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onSubmit: () => void;
};

const topics = [
  { value: 'career', label: '事业' },
  { value: 'emotion', label: '情感' },
  { value: 'growth', label: '成长' },
] as const;

export function QuestionForm({
  question,
  topic,
  pending,
  blocked,
  error,
  onQuestionChange,
  onTopicChange,
  onSubmit,
}: QuestionFormProps) {
  if (blocked) {
    return (
      <div className="panel-card support-card" data-testid="risk-block-page">
        <p className="eyebrow">Risk Block</p>
        <h2>这条问题触发了高风险保护。</h2>
        <p>
          当前页面不会继续占卜流程。请优先联系身边可信的人，或寻求线下专业支持与紧急帮助。
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card">
      <div className="segment-row">
        {topics.map((item) => (
          <button
            key={item.value}
            type="button"
            className={topic === item.value ? 'segment active' : 'segment'}
            onClick={() => onTopicChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="field-label" htmlFor="question-input">
        你的问题
      </label>
      <textarea
        id="question-input"
        data-testid="question-input"
        className="text-area"
        rows={6}
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        placeholder="例如：Should I switch jobs in the next three months?"
      />

      {error ? <p className="error-text">{error}</p> : null}

      <button
        type="button"
        className="primary-button"
        data-testid="question-submit"
        onClick={onSubmit}
        disabled={pending || question.trim().length === 0}
      >
        {pending ? '分析中...' : '查看推荐牌阵'}
      </button>
    </div>
  );
}
