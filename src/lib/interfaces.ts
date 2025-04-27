import { User } from "@/data/PasswordContext";

export interface ActivityListProps {
    user: User | null;          
    logins: Activity[];    
  }
  
/**
 * Interfejs reprezentujący aktywność użytkownika.
 * @interface Activity
 * @property {string} time - Czas aktywności (np. "10:15").
 * @property {string} date - Data aktywności (np. "Dziś", "1 dzień").
 * @property {string} name - Nazwa strony lub aplikacji (np. "Twitter").
 * @property {string} email - Login użytkownika (np. "user123").
 * @property {string} color - Klasa CSS dla koloru (np. "bg-purple-500").
 */
export interface Activity {
    time: string;
    date: string;
    name: string;
    email: string;
    color: string;
}

/**
 * Interfejs reprezentujący dane wykresu.
 * @interface ChartData
 * @property {string} month - Dzień tygodnia (np. "Poniedzialek").
 * @property {number} logins - Liczba logowań w danym dniu.
 */
export interface ChartData {
    month: string;
    logins: number;
  }


  /**
 * Interfejs reprezentujący informacje o nieudanych próbach logowania.
 * Przechowuje liczbę nieudanych prób oraz czas ostatniej próby.
 *
 * @interface FailedLoginAttempt
 */
export interface FailedLoginAttempt {
  /**
   * Liczba nieudanych prób logowania.
   * Wartość jest dodatnią liczbą całkowitą, która zwiększa się po każdej nieudanej próbie.
   *
   * @type {number}
   */
  count: number;

   /**
   * Sygnatura czasowa (timestamp) ostatniej nieudanej próby logowania, wyrażona w milisekundach.
   * Wartość odpowiada czasowi w formacie Unix (epoch), np. zwróconemu przez `Date.now()`.
   *
   * @type {number}
   */
  lastAttempt: number;
}