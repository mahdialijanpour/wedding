const smooth = value => {
  const n = Math.min(1, Math.max(0, value));
  return n * n * (3 - 2 * n);
};

export default function Animated({ as: Tag = 'div', time, start, end = 99, reveal, reducedMotion, style, children, ...props }) {
  const enter = smooth((time - start) / 0.9);
  const leave = smooth((time - end) / 1);
  const opacity = enter * (1 - leave);
  const visible = opacity > 0.001;
  return (
    <Tag {...props} aria-hidden={!visible} style={{
      ...style,
      opacity,
      visibility: visible ? 'visible' : 'hidden',
      transform: reducedMotion ? undefined : `translateY(${(1 - enter) * 6 - leave * 3}px)`,
      clipPath: reveal && !reducedMotion ? `inset(-25% 0 -35% ${(1 - smooth((time - start) / reveal)) * 100}%)` : undefined,
    }}>{children}</Tag>
  );
}
