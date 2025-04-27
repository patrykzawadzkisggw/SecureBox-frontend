import {  LoginEntry, PasswordHistory, PasswordTable, User } from "@/data/PasswordContext";
import { Activity, ChartData, FailedLoginAttempt } from "./interfaces";


/**
 * Wyodrębnia domenę główną z podanego adresu URL, usuwając protokół, subdomeny, ścieżki, parametry zapytania i fragmenty.
 *
 * @function extractDomain
 * @param {string} url - Adres URL do przetworzenia (np. "https://www.google.pl/path?query=1").
 * @returns {string} Znormalizowana domena główna (np. "google.pl").
 *
 * @example
 * ```typescript
 * import { extractDomain } from '@/lib/functions';
 *
 * console.log(extractDomain('https://www.google.pl/path?query=1')); // "google.pl"
 * console.log(extractDomain('http://sub.example.com')); // "example.com"
 * console.log(extractDomain('invalid-url')); // "invalid-url"
 * ```
 *
 * @remarks
 * - Funkcja usuwa protokół (`http://`, `https://`), subdomeny (`www.`, `sub.`), ścieżki (`/path`), parametry zapytania (`?query=1`) oraz fragmenty (`#fragment`).
 * - Jeśli URL ma więcej niż dwie części oddzielone kropkami (np. `sub.example.com`), zwracane są tylko ostatnie dwie części (`example.com`).
 * - W przypadku niepoprawnego URL-a funkcja zwraca wejściowy ciąg bez zmian.
 */
export function extractDomain(url: string): string {
  try {

    let domain = url.replace(/^(https?:\/\/)?/i, '');


    domain = domain.split('/')[0];


    domain = domain.split('?')[0].split('#')[0];


    domain = domain.replace(/^www\./i, '');

    return domain && /^[a-z0-9.-]+$/.test(domain) ? domain : url;
  } catch {
    return url; 
  }
}





/**
 * Formatuje dane aktywności na podstawie wpisu logowania, przekształcając je w obiekt zgodny z interfejsem `Activity`.
 *
 * @function formatActivity
 * @param {Object} entry - Wpis logowania.
 * @param {string} entry.timestamp - Timestamp w formacie ISO (np. "2023-10-01T10:15:00Z").
 * @param {string} entry.login - Login użytkownika (np. "user123").
 * @param {string} entry.page - Nazwa strony (np. "Twitter").
 * @returns {Activity} Sformatowana aktywność zawierająca czas, datę, nazwę strony, email i kolor.
 *
 * @example
 * ```typescript
 * import { formatActivity } from '@/lib/functions';
 *
 * const entry = { timestamp: "2023-10-01T10:15:00Z", login: "user123", page: "Twitter" };
 * const activity = formatActivity(entry);
 * // Wynik: { time: "10:15", date: "Dziś", name: "Twitter", email: "user123", color: "bg-purple-500" }
 * ```
 *
 * @remarks
 * - Funkcja formatuje datę względem bieżącego dnia, zwracając np. "Dziś", "Wczoraj" lub "X dni".
 * - Czas jest formatowany w formacie 24-godzinnym (np. "10:15").
 * - Kolor jest stały (`bg-purple-500`) i nie zależy od danych wejściowych.
 *
 * @see {@link Activity} - Definicja interfejsu `Activity`.
 */
export const formatActivity = (entry: { timestamp: string; login: string; page: string }): Activity => {
  const date = new Date(entry.timestamp);
  
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  let formattedDate = "";
  if (diffInDays === 0) {
    formattedDate = "Dziś";
    if (date.getDate() < now.getDate()) formattedDate = "Wczoraj";
  } else if (diffInDays === 1) {
    formattedDate = "1 dzień";
  } else {
    formattedDate = `${diffInDays} dni`;
  }

  const time = date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    time,
    date: formattedDate,
    name: entry.page,
    email: entry.login,
    color: "bg-purple-500",
  };
};

/**
 * Oblicza średnią siłę haseł na podstawie historii haseł, uwzględniając tylko hasła powiązane z istniejącymi rekordami w tabeli haseł.
 *
 * @function calculateAverageStrength
 * @param {PasswordHistory[]} history - Historia haseł zawierająca platformę, login i siłę hasła.
 * @param {PasswordTable[]} passwords - Tabela haseł zawierająca platformę i login.
 * @returns {number} Średnia siła haseł w procentach (0-100), zaokrąglona do najbliższej liczby całkowitej.
 *
 * @example
 * ```typescript
 * import { calculateAverageStrength } from '@/functions';
 *
 * const history = [{ platform: "test", login: "user", strength: 80 }];
 * const passwords = [{ platform: "test", login: "user" }];
 * const strength = calculateAverageStrength(history, passwords); // Wynik: 80
 * ```
 *
 * @remarks
 * - Jeśli historia haseł jest pusta, funkcja zwraca 100.
 * - Funkcja filtruje historię, uwzględniając tylko rekordy powiązane z istniejącymi hasłami w `passwords`.
 * - Średnia jest obliczana na podstawie pola `strength` w filtrowanej historii.
 *
 * @see {@link PasswordHistory} - Definicja typu `PasswordHistory`.
 * @see {@link PasswordTable} - Definicja typu `PasswordTable`.
 */
export const calculateAverageStrength = (history: PasswordHistory[], passwords : PasswordTable[]): number => {
  if (history.length === 0) return 100.0;
  const hist = [...history].filter((item) =>
    passwords.some(
      (p) => p.platform === item.platform && p.login === item.login
    )
  );
  const totalStrength = hist.reduce((sum, item) => sum + item.strength, 0);
  return Math.round(totalStrength / hist.length) || 100.0;
};

/**
 * Oblicza różnicę czasu między podanym timestampem a bieżącym momentem, zwracając sformatowany ciąg.
 *
 * @function getTimeDifference
 * @param {string} timestamp - Timestamp w formacie ISO (np. "2023-10-01T10:15:00Z").
 * @returns {string} Sformatowany ciąg, np. "Dzisiaj" lub "X dni".
 *
 * @example
 * ```typescript
 * import { getTimeDifference } from '@/lib/functions';
 *
 * console.log(getTimeDifference("2025-04-27T12:00:00Z")); // "Dzisiaj"
 * console.log(getTimeDifference("2025-04-25T12:00:00Z")); // "2 dni"
 * ```
 *
 * @remarks
 * - Funkcja zwraca "Dzisiaj" dla różnicy 0 dni.
 * - Dla różnicy większej niż 0 dni zwraca liczbę dni w formacie "X dni".
 * - Timestamp musi być w poprawnym formacie ISO, w przeciwnym razie wynik może być nieprzewidywalny.
 */
export const getTimeDifference = (timestamp: string) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(timestamp).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Dzisiaj" : `${diffDays} dni`;
  };

  /**
 * Zwraca informacje o sile hasła, w tym tekst opisu i kolor w zależności od wartości siły.
 *
 * @function getStrengthInfo
 * @param {number} strength - Siła hasła w procentach (0-100).
 * @returns {{ text: string; color: string }} Obiekt zawierający opis siły hasła i odpowiadający mu kolor.
 *
 * @example
 * ```typescript
 * import { getStrengthInfo } from '@/lib/functions';
 *
 * console.log(getStrengthInfo(85)); // { text: "Silna", color: "text-purple-700" }
 * console.log(getStrengthInfo(50)); // { text: "Średnia", color: "text-purple-400" }
 * ```
 *
 * @remarks
 * - Siła hasła jest kategoryzowana:
 *   - ≥80: "Silna" (`text-purple-700`)
 *   - ≥60: "Dobra" (`text-purple-500`)
 *   - ≥40: "Średnia" (`text-purple-400`)
 *   - <40: "Słaba" (`text-purple-300`)
 */
export const getStrengthInfo = (strength: number) => {
    if (strength >= 80) return { text: "Silna", color: "text-purple-700" };
    if (strength >= 60) return { text: "Dobra", color: "text-purple-500" };
    if (strength >= 40) return { text: "Średnia", color: "text-purple-400" };
    return { text: "Słaba", color: "text-purple-300" };
  };


  const days = [
    "Poniedzialek",
    "Wtorek",
    "Sroda",
    "Czwartek",
    "Piatek",
    "Sobota",
    "Niedziela",
  ];

/**
 * Przetwarza dane logowań na dane wykresu, zliczając logowania dla każdego dnia tygodnia w ciągu ostatnich 7 dni.
 *
 * @function processLoginData
 * @param {Array<{ timestamp: string }>} logins - Lista logowań zawierająca timestampy w formacie ISO.
 * @returns {ChartData[]} Tablica obiektów z danymi wykresu, zawierająca dzień tygodnia i liczbę logowań.
 *
 * @example
 * ```typescript
 * import { processLoginData } from '@/functions';
 *
 * const logins = [
 *   { timestamp: "2025-04-27T12:00:00Z" }, // Niedziela
 *   { timestamp: "2025-04-27T13:00:00Z" }, // Niedziela
 *    { timestamp: "2025-04-25T12:00:00Z" }, // Piątek
 * ];
 * const chartData = processLoginData(logins);
 * // Wynik: [
 * //   { month: "Poniedziałek", logins: 0 },
 * //   { month: "Wtorek", logins: 0 },
 * //   { month: "Środa", logins: 0 },
 * //   { month: "Czwartek", logins: 0 },
 * //   { month: "Piątek", logins: 1 },
 * //   { month: "Sobota", logins: 0 },
 * //   { month: "Niedziela", logins: 2 }
 * // ]
 * ```
 *
 * @remarks
 * - Funkcja zlicza logowania z ostatnich 7 dni, grupując je według dni tygodnia.
 * - Dni tygodnia są zwracane w polskiej nomenklaturze (np. "Poniedziałek", "Wtorek").
 * - Logowania starsze niż 7 dni są ignorowane.
 *
 * @see {@link ChartData} - Definicja interfejsu `ChartData`.
 */
  export const processLoginData = (logins: { timestamp: string }[]): ChartData[] => {
    const daysOfWeek = days;
    const loginCounts = new Array(7).fill(0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    logins.forEach((entry) => {
      const date = new Date(entry.timestamp);
      if (date >= oneWeekAgo) {
        const dayIndex = date.getDay();
        loginCounts[(dayIndex + 6) % 7] += 1;
      }
    });

    return daysOfWeek.map((day, index) => ({
      month: day,
      logins: loginCounts[index],
    }));
  };

/**
 * Zwraca pięć ostatnich aktywności użytkownika na podstawie jego logowań.
 *
 * @function get5RecentActivities
 * @param {User | null} user - Obiekt użytkownika lub null, jeśli użytkownik nie jest zalogowany.
 * @param {LoginEntry[]} userLogins - Lista wpisów logowania użytkownika.
 * @returns {Activity[]} Tablica maksymalnie pięciu sformatowanych aktywności użytkownika.
 *
 * @example
 * ```typescript
 * import { get5RecentActivities } from '@/lib/functions';
 *
 * const user = { id: "123", first_name: "Jan", last_name: "Kowalski", login: "user123" };
 * const logins = [
 *   { user_id: "123", timestamp: "2025-04-27T12:00:00Z", login: "user123", page: "Twitter" },
 *   { user_id: "123", timestamp: "2025-04-27T13:00:00Z", login: "user123", page: "Google" },
 * ];
 * const activities = get5RecentActivities(user, logins);
 * // Wynik: [
 * //   { time: "12:00", date: "Dziś", name: "Twitter", email: "user123", color: "bg-purple-500" },
 * //   { time: "13:00", date: "Dziś", name: "Google", email: "user123", color: "bg-purple-500" }
 * // ]
 * ```
 *
 * @remarks
 * - Funkcja filtruje logowania, uwzględniając tylko te należące do podanego użytkownika (na podstawie `user_id` lub `userId`).
 * - Wynik jest ograniczony do maksymalnie 5 ostatnich aktywności, sformatowanych za pomocą funkcji `formatActivity`.
 * - Jeśli użytkownik jest `null` lub brak pasujących logowań, zwracana jest pusta tablica.
 *
 * @see {@link formatActivity} - Funkcja `formatActivity`.
 * @see {@link LoginEntry} - Definicja typu `LoginEntry`.
 * @see {@link Activity} - Definicja interfejsu `Activity`.
 */
export function get5RecentActivities(user : User | null, userLogins : LoginEntry[]) {
    return user ? userLogins
      .filter((entry : any) => user && (entry.user_id === user.id || entry.userId === user.id))
      .map(formatActivity)
      .slice(-5) : [];
  }


   

/**
 * Generuje losowy kolor w formacie HEX na podstawie nazwy platformy.
 *
 * @function getRandomColor
 * @param {string} platform - Nazwa platformy.
 * @returns {string} Kolor w formacie HEX (np. "#4ECDC4").
 *
 * @example
 * ```typescript
 * import { getRandomColor } from '@/lib/functions';
 *
 * console.log(getRandomColor("Twitter")); // np. "#4ECDC4"
 * console.log(getRandomColor("Google")); // np. "#45B7D1"
 * ```
 *
 * @remarks
 * - Funkcja używa predefiniowanej listy kolorów i wybiera jeden na podstawie sumy kodów ASCII znaków w nazwie platformy.
 * - Kolor jest deterministyczny dla danej nazwy platformy (ta sama nazwa zawsze zwraca ten sam kolor).
 */
export const getRandomColor = (platform: string): string => {
  const colors = [
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
  ];
  const hash = platform.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * Generuje inicjały (2 znaki) na podstawie nazwy platformy.
 *
 * @function getInitials
 * @param {string} platform - Nazwa platformy.
 * @returns {string} Inicjały platformy (2 znaki, wielkimi literami).
 *
 * @example
 * ```typescript
 * import { getInitials } from '@/lib/functions';
 *
 * console.log(getInitials("Twitter")); // "TW"
 * console.log(getInitials("Google Chrome")); // "GC"
 * console.log(getInitials("FB")); // "FB"
 * ```
 *
 * @remarks
 * - Jeśli nazwa zawiera spacje, inicjały są tworzone z pierwszej litery pierwszego i drugiego słowa.
 * - Jeśli nazwa jest jednym słowem, zwracane są pierwsze dwa znaki.
 * - Wynik jest zawsze wielkimi literami.
 */
export const getInitials = (platform: string): string => {
  const words = platform.split(" ");
  if (words.length > 1) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return platform.slice(0, 2).toUpperCase();
};



/**
 * Maksymalna liczba nieudanych prób logowania przed zablokowaniem konta.
 *
 * @type {number}
 * @default 5
 */
 export const MAX_ATTEMPTS = 5;

 /**
 * Czas trwania blokady konta w milisekundach (10 minut).
 *
 * @type {number}
 * @default 600000
 */
 export const LOCKOUT_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Pobiera rekordy nieudanych prób logowania z `localStorage`.
 *
 * @function getFailedLogins
 * @returns {Record<string, FailedLoginAttempt>} Obiekt mapujący adresy email na dane o nieudanych próbach logowania.
 *
 * @example
 * ```typescript
 * import { getFailedLogins } from '@/lib/functions';
 *
 * localStorage.setItem("failedLogins", JSON.stringify({ "user@example.com": { count: 3, lastAttempt: 1698765432100 } }));
 * console.log(getFailedLogins()); // { "user@example.com": { count: 3, lastAttempt: 1698765432100 } }
 * ```
 *
 * @remarks
 * - Funkcja odczytuje dane z klucza `"failedLogins"` w `localStorage`.
 * - Jeśli dane nie istnieją, zwracany jest pusty obiekt.
 *
 * @see {@link FailedLoginAttempt} - Definicja interfejsu `FailedLoginAttempt`.
 */
 export const getFailedLogins = (): Record<string, FailedLoginAttempt> => {
   const data = localStorage.getItem("failedLogins");
   return data ? JSON.parse(data) : {};
 };

/**
 * Zapisuje rekordy nieudanych prób logowania do `localStorage`.
 *
 * @function saveFailedLogins
 * @param {Record<string, FailedLoginAttempt>} failedLogins - Obiekt mapujący adresy email na dane o nieudanych próbach logowania.
 * @returns {void}
 *
 * @example
 * ```typescript
 * import { saveFailedLogins } from '@/lib/functions';
 *
 * const failedLogins = { "user@example.com": { count: 3, lastAttempt: 1698765432100 } };
 * saveFailedLogins(failedLogins);
 * console.log(localStorage.getItem("failedLogins")); // '{"user@example.com":{"count":3,"lastAttempt":1698765432100}}'
 * ```
 *
 * @remarks
 * - Funkcja zapisuje dane pod kluczem `"failedLogins"` w `localStorage`.
 * - Dane są serializowane do formatu JSON przed zapisem.
 *
 * @see {@link FailedLoginAttempt} - Definicja interfejsu `FailedLoginAttempt`.
 */
 export const saveFailedLogins = (failedLogins: Record<string, FailedLoginAttempt>) => {
   localStorage.setItem("failedLogins", JSON.stringify(failedLogins));
 };

/**
 * Sprawdza, czy konto powiązane z podanym adresem email jest zablokowane z powodu zbyt wielu nieudanych prób logowania.
 *
 * @function isEmailLockedOut
 * @param {string} email - Adres email do sprawdzenia.
 * @returns {boolean} `true`, jeśli konto jest zablokowane, `false` w przeciwnym razie.
 *
 * @example
 * ```typescript
 * import { isEmailLockedOut, recordFailedAttempt } from '@/lib/functions';
 *
 * for (let i = 0; i < 5; i++) recordFailedAttempt("user@example.com");
 * console.log(isEmailLockedOut("user@example.com")); // true
 * ```
 *
 * @remarks
 * - Konto jest uznawane za zablokowane, jeśli liczba nieudanych prób (`count`) osiągnęła lub przekroczyła `MAX_ATTEMPTS` i czas od ostatniej próby (`lastAttempt`) jest krótszy niż `LOCKOUT_DURATION`.
 * - Funkcja korzysta z danych zapisanych w `localStorage` przez `getFailedLogins`.
 *
 * @see {@link MAX_ATTEMPTS} - Stałe `MAX_ATTEMPTS`.
 * @see {@link getFailedLogins} - Funkcja `getFailedLogins`.
 * @see {@link FailedLoginAttempt} - Definicja interfejsu `FailedLoginAttempt`.
 */
 export const isEmailLockedOut = (email: string): boolean => {
   const failedLogins = getFailedLogins();
   const attempt = failedLogins[email];
   if (!attempt || attempt.count < MAX_ATTEMPTS) return false;

   const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
   return timeSinceLastAttempt < LOCKOUT_DURATION;
 };

/**
 * Zwraca pozostały czas blokady konta w sekundach dla podanego adresu email.
 *
 * @function getRemainingLockoutTime
 * @param {string} email - Adres email do sprawdzenia.
 * @returns {number} Pozostały czas blokady w sekundach (0, jeśli konto nie jest zablokowane).
 *
 * @example
 * ```typescript
 * import { getRemainingLockoutTime, recordFailedAttempt } from '@/lib/functions';
 *
 * for (let i = 0; i < 5; i++) recordFailedAttempt("user@example.com");
 * console.log(getRemainingLockoutTime("user@example.com")); // np. 599 (jeśli blokada trwa 10 minut)
 * ```
 *
 * @remarks
 * - Funkcja zwraca 0, jeśli konto nie jest zablokowane lub liczba nieudanych prób jest mniejsza niż `MAX_ATTEMPTS`.
 * - Pozostały czas jest obliczany jako różnica między `LOCKOUT_DURATION` a czasem od ostatniej nieudanej próby.
 * - Wynik jest zaokrąglany w górę do najbliższej sekundy.
 *
 * @see {@link LOCKOUT_DURATION} - Stała `LOCKOUT_DURATION`.
 * @see {@link getFailedLogins} - Funkcja `getFailedLogins`.
 * @see {@link FailedLoginAttempt} - Definicja interfejsu `FailedLoginAttempt`.
 */
 export const getRemainingLockoutTime = (email: string): number => {
   const failedLogins = getFailedLogins();
   const attempt = failedLogins[email];
   if (!attempt || attempt.count < MAX_ATTEMPTS) return 0;

   const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
   const remainingTime = LOCKOUT_DURATION - timeSinceLastAttempt;
   return remainingTime > 0 ? Math.ceil(remainingTime / 1000) : 0;
 };

/**
 * Rejestruje nieudaną próbę logowania dla podanego adresu email.
 *
 * @function recordFailedAttempt
 * @param {string} email - Adres email powiązany z nieudaną próbą logowania.
 * @returns {void}
 *
 * @example
 * ```typescript
 * import { recordFailedAttempt, getFailedLogins } from '@/functions';
 *
 * recordFailedAttempt("user@example.com");
 * console.log(getFailedLogins()); // { "user@example.com": { count: 1, lastAttempt: <timestamp> } }
 * ```
 *
 * @remarks
 * - Funkcja zwiększa licznik nieudanych prób (`count`) i aktualizuje czas ostatniej próby (`lastAttempt`) dla podanego emaila.
 * - Dane są zapisywane w `localStorage` za pomocą funkcji `saveFailedLogins`.
 * - Jeśli email nie istnieje w rekordach, tworzony jest nowy wpis z `count: 1` i bieżącym timestampem.
 *
 * @see {@link getFailedLogins} - Funkcja `getFailedLogins`.
 * @see {@link saveFailedLogins} - Funkcja `saveFailedLogins`.
 * @see {@link FailedLoginAttempt} - Definicja interfejsu `FailedLoginAttempt`.
 */
 export const recordFailedAttempt = (email: string) => {
   const failedLogins = getFailedLogins();
   const attempt = failedLogins[email] || { count: 0, lastAttempt: 0 };
   attempt.count += 1;
   attempt.lastAttempt = Date.now();
   failedLogins[email] = attempt;
   saveFailedLogins(failedLogins);
 };