# Anulowano.pl instrukcja obsługi

###### Szkoła: ZSO nr 11 w Zabrzu

- [Wprowadzanie danych](#wprowadzanie-danych)
  - [Pobieranie z *.edupage.org](#pobieranie-z-edupageorg)
  - [Inne sposoby wprowadzania danych](#inne-sposoby-wprowadzania-danych)
- [Strona](#strona)
  - [Sprawdzanie zastępstw](#sprawdzanie-zastępstw)
    - [Wybór dnia](#wybór-dnia)
    - [Wybór klasy/nauczyciela](#wybór-klasynauczyciela)
  - [Logowanie](#logowanie)
  - [Ustawienia](#ustawienia)
  - [Łączenie kont](#Łączenie-kont)
  - [Szybki dostęp](#szybki-dostęp)
- [Bot](#bot)
  - [Zastępstwa](#zastępstwa)
    - [Dzisiaj](#dzisiaj)
    - [Jutro](#jutro)
    - [Nauczyciele](#nauczyciele)
  - [Pomoc](#pomoc)
  - [Powiadomienia automatyczne](#powiadomienia-automatyczne)

## Wprowadzanie danych

### Pobieranie z *.edupage.org

Serwer jest skonfigurowany tak, by co 10 minut automatycznie pobierać i zapisywać dane dotyczące zastępstw ze stron korzystających z **[ascEduPage](https://edupage.org)**.

### Inne sposoby wprowadzania danych

Aktualnie nie oferujemy innych sposobów wprowadzania danych.

## Strona

Strona umożliwia między innymi sprawdzenie zastępstw oraz ustawienie podstawowych informacji.

### Sprawdzanie zastępstw

Zastępstwa wyświetlają się od razu po wejściu na [stronę](https://anulowano.pl). Jeśli w ustawieniach została wybrana klasa lub nauczyciel, wyświetlane są jedynie zastępstwa dla wybranej klasy/nauczyciela.

#### Wybór dnia

Można wyświetlić zastępstwa na dziś lub dzień kolejny naciskając odpowiednio guziki `today` lub `tomorrow`. Poniżej guzików wyświetla się data jako:
> Changes for `rrrr-mm-dd`

#### Wybór klasy/nauczyciela

Aby wybrać klasę lub nauczyciela należy kliknąć odpowiednią/odpowiedniego klasę/nauczyciela lub zalogować się i [ustawić w ustawieniach](#ustawienia).

***Uwaga:** Wyświetlane są jedynie klasy/nauczyciele mający danego dnia zastępstwa.*

### Logowanie

Aby się zalogować należy kliknąć `Please log in using your Facebook account` lub przejść pod [`/login`](https://anulowano.pl/login).

Logowanie jest potrzebne do wybrania ustawień i włączenia powiadomień automatycznych.</br>
Zalogowanie sygnalizowane jest sygnalizowane wyświetleniem zdjęcia profilowego w prawym górnym rogu lub (na małych ekranach) w menu.

### Ustawienia

Aby otworzyć ustawienia należy kliknąć `Ustawienia` lub w przypadku urządzeń mobilnych `Menu` => `Ustawienia`.
W ustawieniach są dwie zakładki: `Uczeń` i `Nauczyciel`.</br>
W obu zakładkach można wybrać klasę i czy powiadomienia mają być włączone (więcej w: [powiadomienia automatyczne](#powiadomienia-automatyczne)). Zakładka `Nauczyciel` pozwala jednak na wybranie nauczyciela i "wyłączenie" klasy.

***Uwaga:** Aby ustawienia zostały zapisanie po ich wprowadzeniu należy kliknąć `Save settings`.*

### Łączenie kont

Zobacz: [Powiadomienia automatyczne](#powiadomienia-automatyczne)

### Szybki dostęp

Na smartfonach z systemem Android i przeglądarką Chrome (39 i nowsze) lub Firefox (58 i nowsze) istnieje możliwość dodania strony do ekranu głównego. W przypadku używania przeglądarki Firefox wyświetli się odpowiednia ikonka na pasku adresu. Przeglądarka Chrome może wyświetlić u dołu ekranu odpowiedni przycisk. Jeśli przycisk się nie wyświetla można ręcznie w menu przeglądarki wybrać `Dodaj do ekranu głównego`.

## Bot

Interakcja z botem opiera się na prostych komendach, które zostały opisane poniżej.

### Zastępstwa

Bota można odpytać o zastępstwa na dziś lub jutro.

#### Dzisiaj

Aby spytać o zastępstwa na dzień dzisiejszy należy wysłać komendę `0 klasa`, gdzie słowo `klasa` zastępujemy żądaną klasą.

Przykład:

> 0 2b

Odpowiedź:

> Dzisiaj są zastępstwa dla klasy 2b
>
> `Sprawdź na stronie`
>
> `Wyślij na czacie`

***Uwaga:** Jeśli nie wyświetlają się guziki pod wiadomością należy zaktualizować aplikację Messenger.*

Kliknięcie `Wyślij na czacie` spowoduje wysłanie wszystkich zastępstw na dzisiaj dla żądanej klasy.</br>
Kliknięcie `Sprawdź na stronie` otworzy stronę z zastępstwami.

#### Jutro

Aby spytać o zastępstwa na kolejny dzień należy wysłać komendę `1 klasa`, gdzie słowo `klasa` zastępujemy klasą, o którą pytamy. Reszta jak dla "[Dzisiaj](#dzisiaj)".

#### Nauczyciele

Istnieje również możliwość sprawdzenia zastępstw dla nauczyciela. W tym wypadku należy postępować jak pytając o klasę, jednak należy podać nazwisko nauczyciela zamiast klasy.

Lista nauczycieli dostępna jest po naciśnięciu guzika `Nauczyciele`, który wyświetli się po spytaniu o nieistniejącą klasę lub nauczyciela.

***Uwaga:** Niektórzy nauczyciele są wpisani inaczej niż według nazwiska. W takim wypadku warto skorzystać z listy nauczycieli.*

### Pomoc

Aby uzyskać pomoc można skorzystać z przycisku `Pomoc` w menu wyświetlającym się pod czatem (na telefonach) lub po kliknięciu 3 poziomych kresek po lewej od pola wiadomości.</br>
Również po wysłaniu wiadomości nie będącej komendą bot odpowie wysyłając wiadomość z pomocą.

Aby skontaktować się z administratorami, należy zacząć wiadomość od `2`.

Przykład:

> 2 Coś mi nie działa pomóżcie!

Odpowiedź automatyczna:

> Skontaktujemy się aby odpowiedzieć na pytanie.

Później administrator skontaktuje się aby udzielić pomocy.

### Powiadomienia automatyczne

Aby włączyć powiadomienia automatyczne należy:

1. Odwiedzić stronę [anulowano.pl](https://anulowano.pl)
2. Zalogować się korzystając z konta Facebook
3. Kliknąć na zdjęcie profilowe (na telefonach jest w menu)
4. Kliknąć `Kliknij aby włączyć powiadomienia`
5. Kliknąć przycisk `Send To Messenger`, który się pojawi
6. Kliknąć `Ustawienia` (na telefonach jest w menu)
7. Wybrać klasę lub nauczyciela i ustawić `Notification on Messenger` na `yes`
8. Kliknąć `Save settings`

Gotowe! Kiedy pojawią się nowe zastępstwa zostanie wysłana wiadomość.
