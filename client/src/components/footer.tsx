import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  return (
    <footer className="bg-gradient-to-b from-slate-800 to-slate-900 text-white mt-auto md:pr-64" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-orange-400">GlobeMate</h3>
            <p className="text-gray-300 text-sm">
              {t('footer.about_text') || 'Your smart travel companion for worldwide adventures. Plan, track, and share your journeys with AI-powered insights.'}
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors" data-testid="social-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors" data-testid="social-twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors" data-testid="social-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors" data-testid="social-linkedin">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400">{t('footer.quick_links') || 'Quick Links'}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/destinations" className="text-gray-300 hover:text-orange-400 transition-colors text-sm" data-testid="footer-link-destinations">
                  {t('navigation.destinations')}
                </Link>
              </li>
              <li>
                <Link href="/journeys" className="text-gray-300 hover:text-orange-400 transition-colors text-sm" data-testid="footer-link-journeys">
                  {t('navigation.journeys')}
                </Link>
              </li>
              <li>
                <Link href="/hotel-deals" className="text-gray-300 hover:text-orange-400 transition-colors text-sm" data-testid="footer-link-hotel-deals">
                  {t('navigation.hotel_deals')}
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-300 hover:text-orange-400 transition-colors text-sm" data-testid="footer-link-community">
                  {t('navigation.community')}
                </Link>
              </li>
              <li>
                <Link href="/weather" className="text-gray-300 hover:text-orange-400 transition-colors text-sm" data-testid="footer-link-weather">
                  {t('navigation.weather')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400">{t('footer.support') || 'Support'}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-orange-400 transition-colors text-sm" data-testid="footer-link-help">
                  {t('footer.help_center') || 'Help Center'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-orange-400 transition-colors text-sm" data-testid="footer-link-contact">
                  {t('footer.contact_us') || 'Contact Us'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-orange-400 transition-colors text-sm" data-testid="footer-link-about">
                  {t('footer.about_us') || 'About Us'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400">{t('footer.contact_info') || 'Contact'}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-400" />
                <a href="mailto:support@globemate.co.il" className="hover:text-orange-400 transition-colors" data-testid="footer-email">
                  support@globemate.co.il
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-400" />
                <a href="tel:0525530454" className="hover:text-orange-400 transition-colors" data-testid="footer-phone">
                  0525530454
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-400" />
                <span>{t('footer.location') || 'Israel'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} GlobeMate. {t('footer.all_rights_reserved') || 'All rights reserved.'}
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors" data-testid="footer-link-privacy">
                {t('footer.privacy_policy') || 'Privacy Policy'}
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors" data-testid="footer-link-terms">
                {t('footer.terms_of_service') || 'Terms of Service'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
