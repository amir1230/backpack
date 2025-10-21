import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Mail, Phone } from "lucide-react";

export default function Accessibility() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const sections = [
    {
      id: "1",
      title: t("accessibility.sections.commitment.title"),
      content: t("accessibility.sections.commitment.content")
    },
    {
      id: "2",
      title: t("accessibility.sections.standards.title"),
      content: t("accessibility.sections.standards.content")
    },
    {
      id: "3",
      title: t("accessibility.sections.features.title"),
      content: t("accessibility.sections.features.content")
    },
    {
      id: "4",
      title: t("accessibility.sections.assistive.title"),
      content: t("accessibility.sections.assistive.content")
    },
    {
      id: "5",
      title: t("accessibility.sections.ongoing.title"),
      content: t("accessibility.sections.ongoing.content")
    },
    {
      id: "6",
      title: t("accessibility.sections.limitations.title"),
      content: t("accessibility.sections.limitations.content")
    },
    {
      id: "7",
      title: t("accessibility.sections.feedback.title"),
      content: t("accessibility.sections.feedback.content")
    },
    {
      id: "8",
      title: t("accessibility.sections.contact.title"),
      content: t("accessibility.sections.contact.content")
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Eye className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-800 mb-3" data-testid="text-accessibility-title">
            {t("accessibility.title")}
          </h1>
          <p className="text-lg text-gray-600" data-testid="text-accessibility-updated">
            {t("accessibility.last_updated", { date: new Date().toLocaleDateString(i18n.language === 'he' ? 'he-IL' : 'en-US') })}
          </p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8 space-y-8">
            {sections.map((section) => (
              <div key={section.id} data-testid={`accessibility-section-${section.id}`}>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{section.title}</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}

            {/* Contact Information */}
            <div className="bg-blue-50 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4">{t("accessibility.contact_info_title")}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href="mailto:accessibility@globemate.co.il" className="text-primary hover:underline" data-testid="link-accessibility-email">
                    accessibility@globemate.co.il
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <a href="tel:0525530454" className="text-primary hover:underline" data-testid="link-accessibility-phone">
                    0525530454
                  </a>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                {t("accessibility.response_time")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coordinator Info */}
        <div className="mt-8 text-center bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {t("accessibility.coordinator_title")}
          </h3>
          <p className="text-gray-600">{t("accessibility.coordinator_name")}</p>
          <p className="text-gray-600">{t("accessibility.coordinator_role")}</p>
        </div>
      </div>
    </div>
  );
}
