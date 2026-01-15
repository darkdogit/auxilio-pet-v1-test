import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

let sessionId: string | null = null;

const getSessionId = (): string => {
  if (!sessionId) {
    sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);
    }
  }
  return sessionId;
};

const getRegistrationId = (): string | null => {
  return localStorage.getItem('registration_id');
};

interface TrackEventParams {
  eventType: string;
  eventName: string;
  pagePath?: string;
  eventData?: Record<string, any>;
}

export const trackEvent = async ({
  eventType,
  eventName,
  pagePath,
  eventData = {},
}: TrackEventParams) => {
  try {
    const sessionId = getSessionId();
    const registrationId = getRegistrationId();

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');

    await supabase.from('user_events').insert([
      {
        session_id: sessionId,
        registration_id: registrationId,
        event_type: eventType,
        event_name: eventName,
        page_path: pagePath || window.location.pathname,
        event_data: {
          ...eventData,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          referrer: document.referrer,
        },
        user_agent: navigator.userAgent,
      },
    ]);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

export const useAnalytics = (pageName: string) => {
  const hasTrackedPageView = useRef(false);

  useEffect(() => {
    if (!hasTrackedPageView.current) {
      trackEvent({
        eventType: 'page_view',
        eventName: `view_${pageName}`,
        pagePath: window.location.pathname,
        eventData: {
          page_name: pageName,
          referrer: document.referrer,
        },
      });
      hasTrackedPageView.current = true;
    }
  }, [pageName]);

  const trackButtonClick = (buttonName: string, additionalData?: Record<string, any>) => {
    trackEvent({
      eventType: 'button_click',
      eventName: `click_${buttonName}`,
      eventData: {
        button_name: buttonName,
        ...additionalData,
      },
    });
  };

  const trackFormStart = (formName: string) => {
    trackEvent({
      eventType: 'form_start',
      eventName: `start_${formName}`,
      eventData: {
        form_name: formName,
      },
    });
  };

  const trackFormSubmit = (formName: string, success: boolean, error?: string) => {
    trackEvent({
      eventType: success ? 'form_submit' : 'form_error',
      eventName: success ? `submit_${formName}` : `error_${formName}`,
      eventData: {
        form_name: formName,
        success,
        error,
      },
    });
  };

  return {
    trackButtonClick,
    trackFormStart,
    trackFormSubmit,
  };
};
