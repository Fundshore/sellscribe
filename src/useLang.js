import { useState, useEffect } from "react";

export function useLang() {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem("ss_lang") || "en";
  });

  const setLang = (l) => {
    localStorage.setItem("ss_lang", l);
    setLangState(l);
  };

  return [lang, setLang];
}
