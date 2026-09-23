import { useEffect, useState, type ElementType, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from 'react';
import { defaultImagePresentation, type ImagePresentation } from '@arunreah/shared';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';

export const DEFAULT_FALLBACK_IMAGE = '/assets/landing/hero-clinic.png';

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('ui-page-container', className)} {...props} />;
}

type SectionIntroProps = {
  align?: 'center' | 'left';
  as?: ElementType;
  className?: string;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function SectionIntro({
  align = 'left',
  as: Heading = 'h2',
  className,
  description,
  eyebrow,
  title,
}: SectionIntroProps) {
  return (
    <div className={cn(align === 'center' ? 'mx-auto max-w-[680px] text-center' : 'max-w-[680px]', className)}>
      {eyebrow ? <p className="ui-eyebrow text-[12px] font-extrabold uppercase leading-5 tracking-[0.16em] text-[#168aad] sm:tracking-[0.22em]">{eyebrow}</p> : null}
      <Heading className="ui-copy-safe mt-2 text-[26px] font-extrabold leading-[1.18] tracking-[-0.03em] text-[#005687] sm:text-[34px] sm:tracking-[-0.035em]">{title}</Heading>
      {description ? <p className="ui-prose mt-3 text-[#607486]">{description}</p> : null}
    </div>
  );
}

export function ImageFrame({
  alt,
  className,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  loading = 'lazy',
  presentation = defaultImagePresentation,
  src,
}: {
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'eager' | 'lazy';
  presentation?: ImagePresentation;
  src?: string | null;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(src || fallbackSrc);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setImageSrc(src || fallbackSrc);
    setHasFailed(false);
  }, [src, fallbackSrc]);

  if (!imageSrc || hasFailed) return <div aria-hidden="true" className={cn('ui-image-frame', className)} />;

  return (
    <div className={cn('ui-image-frame', className)}>
      <img
        alt={alt}
        decoding="async"
        loading={loading}
        onError={() => {
          if (imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
          } else {
            setHasFailed(true);
          }
        }}
        src={imageSrc}
        style={{
          objectPosition: `${presentation.positionX}% ${presentation.positionY}%`,
          transform: presentation.zoom > 1 ? `scale(${presentation.zoom})` : undefined,
          transformOrigin: `${presentation.positionX}% ${presentation.positionY}%`,
        }}
      />
    </div>
  );
}

/** A lightweight image primitive for heroes and editorial media with an optional local fallback. */
export function ResilientImage({
  alt,
  className,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  loading = 'lazy',
  presentation,
  src,
}: {
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'eager' | 'lazy';
  presentation?: ImagePresentation;
  src?: string | null;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(src || fallbackSrc);
  const [hasFailed, setHasFailed] = useState(false);
  const { positionX, positionY, zoom } = presentation ?? defaultImagePresentation;

  useEffect(() => {
    setImageSrc(src || fallbackSrc);
    setHasFailed(false);
  }, [src, fallbackSrc]);

  if (!imageSrc || hasFailed) return <div aria-hidden="true" className={className} />;

  return (
    <img
      alt={alt}
      className={className}
      decoding="async"
      loading={loading}
      onError={() => {
        if (imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc);
        } else {
          setHasFailed(true);
        }
      }}
      src={imageSrc}
      style={{
        objectPosition: `${positionX}% ${positionY}%`,
        transform: zoom > 1 ? `scale(${zoom})` : undefined,
        transformOrigin: `${positionX}% ${positionY}%`,
      }}
    />
  );
}

/** Consistent public rendering for CMS-controlled focal point and zoom metadata. */
export function CmsImage({
  alt,
  className,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  fit = 'cover',
  loading = 'lazy',
  presentation = defaultImagePresentation,
  src,
  ...props
}: Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'> & {
  alt: string;
  fallbackSrc?: string;
  fit?: 'contain' | 'cover';
  presentation?: ImagePresentation;
  src?: string | null;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(src || fallbackSrc);
  const [hasFailed, setHasFailed] = useState(false);
  const { positionX, positionY, zoom } = presentation;

  useEffect(() => {
    setImageSrc(src || fallbackSrc);
    setHasFailed(false);
  }, [src, fallbackSrc]);

  if (!imageSrc || hasFailed) return <div aria-hidden="true" className={className} />;

  return (
    <img
      alt={alt}
      className={className}
      decoding="async"
      loading={loading}
      onError={() => {
        if (imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc);
        } else {
          setHasFailed(true);
        }
      }}
      src={imageSrc}
      style={{
        objectFit: fit,
        objectPosition: `${positionX}% ${positionY}%`,
        transform: zoom > 1 ? `scale(${zoom})` : undefined,
        transformOrigin: `${positionX}% ${positionY}%`,
      }}
      {...props}
    />
  );
}

/** Keeps split heroes useful on small screens, where an opaque copy panel would otherwise hide the photo. */
export function MobileHeroMedia({
  alt,
  fallbackSrc,
  presentation,
  src,
}: {
  alt: string;
  fallbackSrc: string;
  presentation?: ImagePresentation;
  src?: string | null;
}) {
  return (
    <div className="relative h-[160px] overflow-hidden sm:hidden">
      <ResilientImage alt={alt} className="h-full w-full object-cover object-center" fallbackSrc={fallbackSrc} loading="eager" presentation={presentation} src={src} />
    </div>
  );
}

/** Renders CMS body copy as short paragraphs and real lists when editors use bullet lines. */
export function ContentBlocks({ className, value }: { className?: string; value?: string | null }) {
  if (!value?.trim()) return null;

  const blocks = value.trim().split(/\n{2,}/).filter(Boolean);
  const isBullet = (line: string) => /^[-•+]\s+/.test(line.trim());

  return (
    <div className={cn('ui-prose space-y-3', className)}>
      {blocks.map((block, index) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
        const isList = lines.length > 0 && lines.every(isBullet);

        if (isList) {
          return (
            <ul className="space-y-2 pl-5 marker:text-[#168aad]" key={`${lines[0]}-${index}`}>
              {lines.map((line) => <li key={line}>{line.replace(/^[-•+]\s+/, '')}</li>)}
            </ul>
          );
        }

        return <p className="whitespace-pre-line" key={`${block.slice(0, 24)}-${index}`}>{block}</p>;
      })}
    </div>
  );
}

export function EditorialImage({
  alt,
  caption,
  className,
  fallbackSrc,
  imageClassName,
  presentation,
  src,
}: {
  alt: string;
  caption?: string | null;
  className?: string;
  fallbackSrc?: string;
  imageClassName?: string;
  presentation?: ImagePresentation;
  src?: string | null;
}) {
  return (
    <figure className={className}>
      <ImageFrame alt={alt} className={imageClassName} fallbackSrc={fallbackSrc} presentation={presentation} src={src} />
      {caption ? <figcaption className="ui-caption">{caption}</figcaption> : null}
    </figure>
  );
}

export function PageFeedback({
  action,
  body,
  title,
}: {
  action?: ReactNode;
  body?: string;
  title: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7fafc] px-4">
      <Card className="max-w-lg p-7 text-center sm:p-8">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687]">{title}</h1>
        {body ? <p className="ui-prose mt-3 text-[#607486]">{body}</p> : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </Card>
    </main>
  );
}

export function renderHeroTitle(title: string, language?: 'en' | 'km'): ReactNode {
  const trimmed = title.trim();
  if (!trimmed) return null;

  if (language === 'km') {
    if (trimmed.includes('អរុណរះ')) {
      const idx = trimmed.indexOf('អរុណរះ');
      const firstPart = trimmed.slice(0, idx).trim();
      const secondPart = trimmed.slice(idx).trim();
      return (
        <>
          <span>{firstPart || 'គ្លីនិកធ្មេញ'}</span>
          <span className="block text-[#0080c8]">{secondPart}</span>
        </>
      );
    }
    return <span>{trimmed}</span>;
  }

  // English: look for common brand phrases
  for (const phrase of ['dental clinic', 'dental team', 'dental care']) {
    const lower = trimmed.toLowerCase();
    if (lower.includes(phrase)) {
      const idx = lower.indexOf(phrase);
      const firstPart = trimmed.slice(0, idx).trim();
      const secondPart = trimmed.slice(idx, idx + phrase.length);
      const rest = trimmed.slice(idx + phrase.length);
      if (firstPart) {
        return (
          <>
            <span>{firstPart}</span>
            <span className="block text-[#0080c8]">{secondPart}{rest}</span>
          </>
        );
      }
    }
  }

  // Generic split: if 3 or more words, put the last 2 words in brand blue on line 2
  const words = trimmed.split(/\s+/);
  if (words.length >= 3) {
    const firstPart = words.slice(0, -2).join(' ');
    const secondPart = words.slice(-2).join(' ');
    return (
      <>
        <span>{firstPart}</span>
        <span className="block text-[#0080c8]">{secondPart}</span>
      </>
    );
  }

  return <span>{trimmed}</span>;
}

export type ContactIconName = 'clock' | 'email' | 'location' | 'phone';

export function ContactIcon({ className = 'size-[18px]', name }: { className?: string; name: ContactIconName }) {
  const iconPath = {
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.8v4.45l3 1.75" />
      </>
    ),
    email: (
      <>
        <path d="M4 7h16v10H4z" />
        <path d="m5 8 7 5 7-5" />
      </>
    ),
    location: (
      <>
        <path
          d="M12 21s7-5.92 7-11.7A6.86 6.86 0 0 0 12 2.4a6.86 6.86 0 0 0-7 6.9C5 15.08 12 21 12 21Z"
          fill="currentColor"
          stroke="none"
        />
        <circle cx="12" cy="9.3" fill="white" r="2.1" stroke="none" />
      </>
    ),
    phone: (
      <path
        d="M7.25 4.25 9.6 3.7l2 4.65-1.9 1.25a9.75 9.75 0 0 0 4.7 4.7l1.25-1.9 4.65 2-0.55 2.35a2 2 0 0 1-2.25 1.52C10.8 17.3 6.7 13.2 5.73 6.5a2 2 0 0 1 1.52-2.25Z"
        fill="currentColor"
        stroke="none"
      />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {iconPath[name]}
    </svg>
  );
}

export function InfoBlock({
  compact = false,
  item,
}: {
  compact?: boolean;
  item: { description?: string | null; icon: ContactIconName; label: string; value: string };
}) {
  return (
    <div className={`flex items-center ${compact ? 'gap-4' : 'gap-5'}`}>
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-[#eef8fb] text-[#3695b9] ${
          compact ? 'size-[38px]' : 'size-[46px]'
        }`}
      >
        <ContactIcon className={compact ? 'size-[15px]' : 'size-[18px]'} name={item.icon} />
      </span>
      <div className="min-w-0 break-words">
        <p className="text-[12px] font-extrabold leading-4 text-[#3695b9]">{item.label}</p>
        <p className={`whitespace-pre-line font-extrabold text-[#005687] ${compact ? 'text-[14px] leading-5' : 'text-[16px] leading-6'}`}>
          {item.value}
        </p>
        {!compact && item.description && item.description !== item.value ? (
          <p className="text-[12px] font-medium leading-4 text-[#64748b]">{item.description}</p>
        ) : null}
      </div>
    </div>
  );
}

export type HeroInfoItem = {
  description?: string | null;
  icon: ContactIconName;
  label: string;
  value: string;
};

export type PublicPageHeroProps = {
  backgroundImageAlt?: string;
  backgroundImageUrl?: string;
  eyebrow?: string;
  fallbackSrc?: string;
  imagePresentation?: ImagePresentation;
  info?: HeroInfoItem[];
  subtitle?: string;
  title: string;
};

export function PublicPageHero({
  backgroundImageAlt,
  backgroundImageUrl,
  eyebrow,
  fallbackSrc = '/assets/landing/figma-branches/image2_183_4173.png',
  imagePresentation,
  info,
  subtitle,
  title,
}: PublicPageHeroProps) {
  const imageUrl = backgroundImageUrl || fallbackSrc;
  return (
    <section className="border-b border-[#e7eff3] bg-[#f7fafc] py-5 sm:py-7">
      <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl border border-[#d9e9ee] bg-[#f7fafc] px-4 sm:px-6 lg:px-8">
        <ResilientImage
          alt={backgroundImageAlt || title}
          className="absolute inset-0 h-full w-full object-cover object-center contrast-[1.06] saturate-[1.05]"
          fallbackSrc={fallbackSrc}
          presentation={imagePresentation}
          src={imageUrl}
        />
        <div className={`relative z-10 grid items-center gap-6 py-8 sm:min-h-[360px] sm:py-10 ${info && info.length > 0 ? 'lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8' : ''}`}>
          <div className="max-w-[620px]">
            {eyebrow ? (
              <p className="ui-eyebrow text-[11px] font-extrabold uppercase leading-4 tracking-[3px] text-[#3695B9] sm:text-[12px] sm:tracking-[3.6px]">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:mt-3 sm:text-[38px]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 max-w-[560px] text-[16px] font-medium leading-7 text-[#0e3b5e]">
                {subtitle}
              </p>
            ) : null}
          </div>
          {info && info.length > 0 ? (
            <Card className="rounded-2xl border-[#d9e9ee] bg-white/95 p-5 shadow-[0_4px_20px_rgba(0,86,135,0.08)] backdrop-blur-md sm:p-6">
              <div className="space-y-4">
                {info.map((item) => (
                  <InfoBlock compact item={item} key={item.label} />
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  );
}
