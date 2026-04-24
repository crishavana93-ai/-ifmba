/**
 * LangToggle — SV / EN switch pinned in the navbar.
 *
 * Compact pill button. Click cycles SV ⇄ EN. Active language is shown in
 * bold yellow; the other sits at 60% opacity. Preference is persisted
 * via the i18n context (localStorage).
 */
'use client'

import { useLang } from '@/lib/i18n'

export default function LangToggle() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="lang-toggle" role="group" aria-label={t('lang.aria')}>
      <button
        type="button"
        className={`lang-opt${lang === 'sv' ? ' active' : ''}`}
        onClick={() => setLang('sv')}
        aria-pressed={lang === 'sv'}
        aria-label="Svenska"
      >
        SV
      </button>
      <span className="lang-sep" aria-hidden="true">/</span>
      <button
        type="button"
        className={`lang-opt${lang === 'en' ? ' active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        aria-label="English"
      >
        EN
      </button>
    </div>
  )
}
