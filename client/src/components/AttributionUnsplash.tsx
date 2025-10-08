import { useTranslation } from "react-i18next";

interface AttributionUnsplashProps {
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  className?: string;
}

export default function AttributionUnsplash({ user, className = "" }: AttributionUnsplashProps) {
  const { t } = useTranslation();

  return (
    <div className={`text-xs text-gray-600 dark:text-gray-400 ${className}`}>
      {t("media.unsplash.attributionPrefix", "Photo by")}{" "}
      <a
        href={user.links.html}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-800 dark:hover:text-gray-200"
      >
        {user.name}
      </a>{" "}
      {t("media.unsplash.onUnsplash", "on")}{" "}
      <a
        href="https://unsplash.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-800 dark:hover:text-gray-200"
      >
        Unsplash
      </a>
    </div>
  );
}
