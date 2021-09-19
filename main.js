const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const requestPromise = require('request-promise');
const Json2csvParser = require('json2csv').Parser;

const urls = [
  {
    url: 'https://www.imdb.com/title/tt12714854/?ref_=hm_fanfav_tt_i_4_pd_fp1',
    id: 'Mumbai Diaries',
    MOVIE_ID: `tt12714854`
  },
  {
    url: 'https://www.imdb.com/title/tt6334354/?ref_=hm_fanfav_tt_i_3_pd_fp1',
    id: 'The Suicide Squad',
    MOVIE_ID: `tt6334354`
  },
  {
    url: `https://www.imdb.com/title/tt14479078/?ref_=hm_tpks_tt_t_1_pd_tp1_cp`,
    id: 'Candy',
    MOVIE_ID: `tt14479078`
  },
  {
    url: 'https://www.imdb.com/title/tt9376612/?ref_=watch_fanfav_tt_t_1',
    id: "Shang-Chi and the Legend of the Ten Rings",
    MOVIE_ID: `tt9376612`
  },
  {
    url: "https://www.imdb.com/title/tt1160419/?ref_=watch_fanfav_tt_i_2",
    id: "Dune",
    MOVIE_ID: `tt1160419`
  },
  {
    url: "https://www.imdb.com/title/tt3228774/?ref_=watch_fanfav_tt_i_4",
    id: "Cruella",
    MOVIE_ID: `tt3228774`
  },
  {
    url: "https://www.imdb.com/title/tt6468322/?ref_=watch_fanfav_tt_i_5",
    id: "Money Heist",
    MOVIE_ID: `tt6468322`
  },
  {
    url: "https://www.imdb.com/title/tt10322274/?ref_=watch_fanfav_tt_i_6",
    id: "Schumacher",
    MOVIE_ID: `tt10322274`
  }
];

(async () => {
  let moviesData = [];
  for (let movie of urls) {
    const browser = await puppeteer.launch({
      headless: false, defaultViewport: null,
      args: ["'--window-size=900,900'"],
    });
    const page = await browser.newPage();

    /* Go to the IMDB Movie page and wait for it to load */
    const response = await requestPromise({
      url: movie.url
    });

    let $ = cheerio.load(response);

    await page.goto(movie.url);

    let data = await page.evaluate(() => {
      let title = document.querySelector('.TitleBlock__TitleContainer-sc-1nlhx7j-1.jxsVNt > h1').innerText;
      let rating = document.querySelector('span[class="AggregateRatingButton__RatingScore-sc-1ll29m0-1 iTLWoV"]').innerText;
      let ratingCount = document.querySelector('div[class="AggregateRatingButton__TotalRatingAmount-sc-1ll29m0-3 jkCVKJ"]').innerText;
      let popularity = document.querySelector('#__next > main > div > section.ipc-page-background.ipc-page-background--base.TitlePage__StyledPageBackground-wzlr49-0.dDUGgO > section > div:nth-child(4) > section > section > div.Hero__MediaContentContainer__Video-kvkd64-2.kmTkgc > div.Hero__ContentContainer-kvkd64-10.eaUohq > div.Hero__MetaContainer__Video-kvkd64-4.kNqsIK > div.RatingBar__RatingContainer-sc-85l9wd-0.hNqCJh.Hero__HideableRatingBar-kvkd64-12.hBqmiS > div > div:nth-child(3) > a > div > div > div.TrendingButton__ContentWrap-bb3vt8-0.dJEFvu > div.TrendingButton__TrendingScore-bb3vt8-1.gfstID').innerText;
      /* Returns  an object filled with the scraped data */
      return {
        title,
        rating,
        ratingCount,
        popularity,
      }

    });
    let genres = [];
    $('div[class="ipc-chip-list GenresAndPlot__GenresChipList-cum89p-4 gtBDBL"] a[href^="/search/title?genres"] ').each((i, elm) => {
      let genre = $(elm).text();
      genres.push(genre);
    });
    let poster = $('div[class="ipc-media ipc-media--poster ipc-image-media-ratio--poster ipc-media--baseAlt ipc-media--poster-l ipc-poster__poster-image ipc-media__img"] > img').attr('src');

    let obj = {
      title: data.title,
      rating: data.rating,
      aggregateRating: data.ratingCount,
      popularity: data.popularity,
      genres: genres,
      poster: poster
    }
    moviesData.push(obj);
    console.log(movie.id + " "+ movie.MOVIE_ID);
    console.log(obj);
    await browser.close();
  }
  console.log(moviesData);
  const json2csvParser = new Json2csvParser({});
  const csv = json2csvParser.parse(moviesData);
  fs.writeFileSync('moviesdb.csv', csv, 'utf-8');
  console.log("successfull...!!!")

})();
