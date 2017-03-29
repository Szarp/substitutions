# Lokalizacja

/home/krzys/substitutions

# komendy

jak masz to obsługiwać

## z gita

te komendy jako user krzys

`git fetch --all` - pobierasz z gita

`git reset --hard origin/branch` - resetujesz do stanu oryginalnego dla brancha "branch"

Potem po prostu `git pull`

`git checkout branch`  - zmieniasz na branch

## uruchom

`service botMSG start|restart|stop` - jako root

# Pamiętaj aby zmienić port w crossServer na 8089 - po to powyższe komendy, żeby normalnie szło bez merga

## Inne komendy

Execute as root:

`service crossServer start` <= starts or restarts (if alreadyrunning) crossServer and creates an archive with previous log

`service crossServer stop` <= stops crossServer if running

`service crossServer restart` <= same as start


`service mon start` <= should start/restart mongodb (may not work if already running)

`service mon stop` <= should stop mongodb (may not work)

`service mon restart` <= should restart mongodb (may not work)

`service mon uninstall` <= should completely remove mongodb service (NOT mongodb, only service)


`service redirect start` <= should start/restart server redirecting to https/informing about wrong domain (may not work if already running)

`service redirect stop` <= should stop redirect server (may not work)

`service redirect restart` <= should restart redirect server (may not work)

`service redirect uninstall` <= should remove redirect service, will keep logs and server
