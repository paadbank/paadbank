'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES, type SupportedLang } from '@/context/LanguageContext';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useDialog } from '@/lib/DialogViewer';
import { SelectionViewer, useSelectionController } from '@/lib/SelectionViewer';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { useDemandState } from '@/lib/state-stack';
import styles from './page.module.css';

const LANGUAGE_NAMES: Record<SupportedLang, string> = {
  en: 'English',
  fr: 'Français'
};

const LanguageItem = ({ onClick, text, theme }: { onClick: () => void; text: string; theme: string }) => {
  return (
    <div
      className={styles.languageItem}
      onClick={onClick}
      role="button"
      tabIndex={0}
      style={{ color: theme === 'light' ? '#2d2d2d' : '#f5f0e8' }}
    >
      {text}
    </div>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const { session } = useAuthContext();
  const signOutDialog = useDialog();
  const [signingOut, setSigningOut] = useState(false);
  const [languageSelectId, languageSelectController, languageSelectIsOpen, languageSelectionState] = useSelectionController();
  const [profile, demandProfile, setProfile, { isHydrated }] = useDemandState<any>(null, {
    key: 'profile',
    persist: true,
    scope: 'global',
  });
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    occupation: '',
    date_of_birth: '',
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    demandProfile(async ({ set }) => {
      const { data } = await supabaseBrowser
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (data) {
        set(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          location: data.location || '',
          occupation: data.occupation || '',
          date_of_birth: data.date_of_birth || '',
        });
      }
    });
  }, [session?.user?.id]);

  const handleSave = async () => {
    const { error } = await supabaseBrowser
      .from('profiles')
      .update(formData)
      .eq('id', session?.user?.id);
    if (!error) {
      setProfile({ ...profile, ...formData });
      setEditing(false);
    }
  };

  const languages = SUPPORTED_LANGUAGES
    .filter(code => code !== lang)
    .map(code => ({
      code,
      name: LANGUAGE_NAMES[code]
    }));

  const handleSignOut = () => {
    signOutDialog.open(
      <div style={{ textAlign: 'center' }}>
        <p>{t('confirm_sign_out') || 'Are you sure you want to sign out?'}</p>
      </div>
    );
  };

  const confirmSignOut = async () => {
    try {
      setSigningOut(true);
      await supabaseBrowser.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      setSigningOut(false);
    }
  };

  const handleLanguageSwitch = () => {
    languageSelectController.setSelectionState("data");
    languageSelectController.open();
  };

  const handleLanguageSelect = (code: SupportedLang) => {
    setLang(code);
    languageSelectController.close();
  };

  return (
    <div className={styles.container}>
      {!isHydrated || !profile ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.content}>
        <div className={styles.topSection}>
          <h1 className={styles.title}>{t('profile')}</h1>
          <div className={styles.iconButtons}>
            <button 
              onClick={handleLanguageSwitch} 
              className={styles.iconButton}
              title={t('switch_language') || 'Switch Language'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="currentColor"/>
              </svg>
            </button>

            <button 
              onClick={toggleTheme} 
              className={styles.iconButton}
              title={t('switch_theme') || 'Switch Theme'}
            >
              {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            <button 
              onClick={handleSignOut} 
              className={styles.iconButton}
              disabled={signingOut}
              title={t('logout') || 'Logout'}
            >
              <svg fill="none" height="20" viewBox="0 0 26 20" width="26" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.6431 16.8182V10.9091H9.22783C8.98155 10.9091 8.74537 10.8133 8.57122 10.6428C8.39708 10.4723 8.29924 10.2411 8.29924 10C8.29924 9.75889 8.39708 9.52766 8.57122 9.35718C8.74537 9.18669 8.98155 9.09091 9.22783 9.09091H17.6431V3.18182C17.6422 2.33822 17.2995 1.52944 16.6902 0.93293C16.0809 0.336419 15.2548 0.000902401 14.3931 0H3.25005C2.38837 0.000902401 1.56224 0.336419 0.952937 0.93293C0.343633 1.52944 0.000921753 2.33822 0 3.18182V16.8182C0.000921753 17.6618 0.343633 18.4706 0.952937 19.0671C1.56224 19.6636 2.38837 19.9991 3.25005 20H14.3931C15.2548 19.9991 16.0809 19.6636 16.6902 19.0671C17.2995 18.4706 17.6422 17.6618 17.6431 16.8182ZM22.8299 10.9091L19.7725 13.9028C19.6057 14.0747 19.5141 14.3036 19.5172 14.5406C19.5203 14.7777 19.6179 15.0042 19.7891 15.1718C19.9603 15.3395 20.1917 15.435 20.4338 15.438C20.676 15.441 20.9097 15.3514 21.0853 15.1881L25.7282 10.6426C25.9022 10.4721 26 10.241 26 10C26 9.759 25.9022 9.52786 25.7282 9.35739L21.0853 4.81193C20.9097 4.64864 20.676 4.55895 20.4338 4.56199C20.1917 4.56502 19.9603 4.66054 19.7891 4.82818C19.6179 4.99582 19.5203 5.22231 19.5172 5.45937C19.5141 5.69642 19.6057 5.92528 19.7725 6.09716L22.8299 9.09091H17.6431V10.9091H22.8299Z" fill="#FF0000" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`${styles.card} ${styles[`card_${theme}`]}`}>
          <div className={styles.avatar}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          
          <div className={styles.info}>
            {editing ? (
              <>
                <div className={styles.field}>
                  <label>{t('full_name')}</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label>{t('phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label>{t('location')}</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label>{t('occupation')}</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label>{t('date_of_birth')}</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <button onClick={handleSave} className={styles.saveButton}>{t('save')}</button>
                  <button onClick={() => setEditing(false)} className={styles.cancelButton}>{t('cancel')}</button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.field}>
                  <label>{t('email')}</label>
                  <p>{profile?.email || 'Not available'}</p>
                </div>
                <div className={styles.field}>
                  <label>{t('full_name')}</label>
                  <p>{profile?.full_name || 'Not set'}</p>
                </div>
                <div className={styles.field}>
                  <label>{t('phone')}</label>
                  <p>{profile?.phone || 'Not set'}</p>
                </div>
                <div className={styles.field}>
                  <label>{t('location')}</label>
                  <p>{profile?.location || 'Not set'}</p>
                </div>
                <div className={styles.field}>
                  <label>{t('occupation')}</label>
                  <p>{profile?.occupation || 'Not set'}</p>
                </div>
                <div className={styles.field}>
                  <label>{t('date_of_birth')}</label>
                  <p>{profile?.date_of_birth || 'Not set'}</p>
                </div>
                <div className={styles.field}>
                  <label>{t('role')}</label>
                  <p>{profile?.role || 'Not set'}</p>
                </div>
                <button onClick={() => setEditing(true)} className={styles.editButton}>{t('edit')}</button>
              </>
            )}
          </div>
        </div>
      </div>
      )}

      <signOutDialog.DialogViewer
        title={t('logout')}
        buttons={[
          {
            text: signingOut ? '' : t('yes_text') || 'Yes',
            variant: 'primary',
            loading: signingOut,
            onClick: confirmSignOut
          },
          {
            text: t('no_text') || 'No',
            variant: 'secondary',
            disabled: signingOut,
            onClick: () => signOutDialog.close()
          }
        ]}
        showCancel={false}
        closeOnBackdrop={!signingOut}
        layoutProp={{
          backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
          margin: '16px 16px',
          titleColor: theme === 'light' ? '#2d2d2d' : '#f5f0e8'
        }}
      />

      <SelectionViewer
        id={languageSelectId}
        isOpen={languageSelectIsOpen}
        onClose={languageSelectController.close}
        titleProp={{
          text: t('language') || 'Language',
          textColor: theme === 'light' ? "#2d2d2d" : "#f5f0e8"
        }}
        layoutProp={{
          backgroundColor: theme === 'light' ? "#fff" : "#2d2d2d",
          handleColor: "#888",
          handleWidth: "48px",
        }}
        childrenDirection="vertical"
        snapPoints={[0, 1]}
        initialSnap={1}
        minHeight="30vh"
        maxHeight="50vh"
        closeThreshold={0.2}
        selectionState={languageSelectionState}
        zIndex={1000}
      >
        {languages.map((language) => (
          <LanguageItem
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            text={language.name}
            theme={theme}
          />
        ))}
      </SelectionViewer>
    </div>
  );
}
