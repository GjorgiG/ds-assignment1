import {Club, ClubPlayer} from '../shared/types'

export const clubs : Club[] = [
  {
    id: 1234,
    city: 'Manchester',
    name: 'Manchester United',
    year_founded: 1878
  },
  {
    id: 6789,
    city: 'This is in English',
    name: 'This is in Spanish',
    year_founded: 1878
  },
  {
    id: 2345,
    city: 'Manchester',
    name: 'Manchester City',
    year_founded: 1880
  },
  {
    id: 698991,
    city: 'North London',
    name: 'Arsenal',
    year_founded: 1886
  },
  {
    id: 704200,
    city: 'North London',
    name: 'Tottenham Hotspur',
    year_founded: 1882
  },
  {
    id: 452540,
    city: 'West London',
    name: 'Chelsea',
    year_founded: 1905
  },
  {
    id: 871711,
    city: 'Liverpool',
    name: 'Liverpool FC',
    year_founded: 1892
  },
  {
    id: 136141,
    city: 'West London',
    name: 'Fulham',
    year_founded: 1879
  },
  {
    id: 755702,
    city: 'Newcastle',
    name: 'Newcastle FC',
    year_founded: 1892
  },
  {
    id: 119270,
    city: 'Nottingham',
    name: 'Nottingham Forest',
    year_founded: 1865
  },
  {
    id: 906225,
    city: 'Birmingham',
    name: 'Aston Villa',
    year_founded: 1874
  },
  {
    id: 583279,
    city: 'Brighton',
    name: 'Brighton & Hove Albion',
    year_founded: 1901
  }
]

export const clubPlayers: ClubPlayer[] = [
  {
    clubId: 2345,
    playerName: 'Erling Haaland',
    value: 150000000,
    age: 24,
    nationality: 'Norwegian',
    appearances: 10,
    club: 'Manchester City',
    league: 'Premier League',
    position: 'Striker'
  },
  {
    clubId: 2345,
    playerName: 'Josko Gvardiol',
    value: 100000000,
    age: 22,
    nationality: 'Croatian',
    appearances: 10,
    club: 'Manchester City',
    league: 'Premier League',
    position: 'Defender'
  },
  {
    clubId: 698991,
    playerName: 'Bukayo Saka',
    value: 150000000,
    age: 23,
    nationality: 'English',
    appearances: 10,
    club: 'Arsenal',
    league: 'Premier League',
    position: 'Winger'
  },

  {
    clubId: 698991,
    playerName: 'Gabriel Magalhaes',
    value: 80000000,
    age: 26,
    nationality: 'Brazilian',
    appearances: 10,
    club: 'Arsenal',
    league: 'Premier League',
    position: 'Defender'
  },
  {
    clubId: 1234,
    playerName: 'Bruno Fernandes',
    value: 80000000,
    age: 30,
    nationality: 'Portuguese',
    appearances: 10,
    club: 'Manchester United',
    league: 'Premier League',
    position: 'Midfielder'
  },
  {
    clubId: 1234,
    playerName: 'Noussair Mazraoui',
    value: 20000000,
    age: 26,
    nationality: 'Moroccan',
    appearances: 10,
    club: 'Manchester United',
    league: 'Premier League',
    position: 'Defender'
  },
  {
    clubId: 452540,
    playerName: 'Marc Cucurella',
    value: 50000000,
    age: 26,
    nationality: 'Spanish',
    appearances: 9,
    club: 'Chelsea',
    league: 'Premier League',
    position: 'Defender'
  },
  {
    clubId: 452540,
    playerName: 'Nicolas Jackson',
    value: 60000000,
    age: 23,
    nationality: 'Senegalese',
    appearances: 10,
    club: 'Chelsea',
    league: 'Premier League',
    position: 'Striker'
  },
  {
    clubId: 583279,
    playerName: 'Bart Verbruggen',
    value: 40000000,
    age: 22,
    nationality: 'Dutch',
    appearances: 8,
    club: 'Brighton & Hove Albion',
    league: 'Premier League',
    position: 'Goalkeeper'
  },
  {
    clubId: 583279,
    playerName: 'Ferdi Kadioglu',
    value: 40000000,
    age: 25,
    nationality: 'Turkish',
    appearances: 6,
    club: 'Brighton & Hove Albion',
    league: 'Premier League',
    position: 'Defender'
  }
];


