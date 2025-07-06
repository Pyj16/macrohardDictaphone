# Medicinski Diktafon
## Kazalo
- [O Aplikaciji](#o-aplikaciji)
- [Namestitev](#namestitev)
- [Struktura](#struktura)

# O Aplikaciji

Aplikacija namenjena zdravnikom in administratorjem v bolišnici za lažje delo z anamnezami.
- Pomaga zdravnikom z snemanje, urejanje, avtomatsko pretvarjanje in generiranje besedilo anamnez iz posnetkov.
- Pomaga administratorjem z lažjo upravljanje z anamnezami.


# Namestitev

Za prenos mape in namestitev prvič naredite
```
github clone https://github.com/FeriCodeDummy/macrohardDictaphone
```

Potem z uporabe Node prenesite vse odvisnosti
```
npm i
```

Z povezanim mobilnim temefonom, gelde operacijskega sistema, naložite aplikacijo z
```angular2html
eas build --platform android
```
ali
```angular2html
eas build --platform ios
```

 

# Struktura

```
-app                - glavna mapa projekta
--(auth)            - avtorizacija zdravnika/administratorja
--(tabs)            - glavni strani aplikacije
---(administrator)  - strani za administrator
---(doctor)         - strani za zdravnik
--services          - avtorizacija in šifriranje
```