'use client';

type FollowUpFormProps = {
  message: string;
  reply: string;
  pending: boolean;
  error: string;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
};

export function FollowUpForm({
  message,
  reply,
  pending,
  error,
  onMessageChange,
  onSubmit,
}: FollowUpFormProps) {
  return (
    <div className="panel-card form-panel">
      <label className="field-label" htmlFor="followup-message">
        针对这次结果继续追问
      </label>
      <textarea
        id="followup-message"
        className="text-area"
        rows={5}
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
        placeholder="例如：如果我选择 A 方案，接下来最值得注意的变化是什么？"
      />

      <p className="muted-text">
        follow-up 只会绑定当前 reading，不会越到其他结果或其他会话里。
      </p>

      {error ? <p className="error-text">{error}</p> : null}

      <button
        type="button"
        className="primary-button"
        onClick={onSubmit}
        disabled={pending || message.trim().length === 0}
      >
        {pending ? '正在追问…' : '提交追问'}
      </button>

      {reply ? (
        <div className="reply-card">
          <p className="eyebrow">Follow-up Reply</p>
          <p>{reply}</p>
        </div>
      ) : null}
    </div>
  );
}
