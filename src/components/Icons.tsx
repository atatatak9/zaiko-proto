interface IconProps {
  size?: number | string;
  class?: string;
  className?: string;
  color?: string;
  strokeWidth?: number | string;
  style?: Record<string, string | number>;
}

function BaseSvg({
  size = 20,
  class: cls = '',
  className = '',
  color = 'currentColor',
  strokeWidth = 2,
  style = {},
  children
}: IconProps & { children: preact.ComponentChildren }) {
  const combinedClass = (cls + ' ' + className).trim();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={combinedClass || undefined}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      {children}
    </svg>
  );
}

export function IconPackage(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
      <path d="m7.5 4.27 9 5.15" />
    </BaseSvg>
  );
}

export function IconTag(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </BaseSvg>
  );
}

export function IconCalendarCheck(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </BaseSvg>
  );
}

export function IconPenLine(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </BaseSvg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
    </BaseSvg>
  );
}

export function IconCalendarPlus(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <path d="M10 16h4" />
      <path d="M12 14v4" />
    </BaseSvg>
  );
}

export function IconTrash2(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </BaseSvg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </BaseSvg>
  );
}

export function IconX(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </BaseSvg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <path d="m9 18 6-6-6-6" />
    </BaseSvg>
  );
}

export function IconArrowLeft(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </BaseSvg>
  );
}

export function IconInbox(props: IconProps) {
  return (
    <BaseSvg {...props}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </BaseSvg>
  );
}
