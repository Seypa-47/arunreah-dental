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
