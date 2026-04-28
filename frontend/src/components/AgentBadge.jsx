const categoryConfig = {
  text: { label: 'Text AI', class: 'badge-text', icon: '📝' },
  code: { label: 'Code AI', class: 'badge-code', icon: '💻' },
  data: { label: 'Data AI', class: 'badge-data', icon: '🔍' },
};

export default function AgentBadge({ category }) {
  const config = categoryConfig[category] || { label: category, class: 'badge-text', icon: '🤖' };

  return (
    <span className={config.class}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
