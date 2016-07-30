import React from 'react'
import { TranslatorProvider } from 'react-translate'
import { connect } from 'react-redux'
import { changeLanguage } from '../../action-creators/lang'
import { changeRoute } from '../../action-creators/location'
import { lookupWord, selectWord } from '../../action-creators/word'

import styles from './main.css'
import Results from '../results'
import LanguagePicker from '../language-picker'
import SeeAlso from '../see-also'
import Suggestions from '../suggestions'
import Logo from '../logo'
import Loader from '../loader'
import Footer from '../footer'
import Cases from '../cases'
import translations from '../../../translations.yaml'

const isMobile = 'ontouchstart' in window

class Main extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    location: React.PropTypes.shape({
      query: React.PropTypes.string,
      id: React.PropTypes.string,
      tag: React.PropTypes.string,
    }),
    word: React.PropTypes.shape({
      result: React.PropTypes.object,
      current: React.PropTypes.object,
      otherMatches: React.PropTypes.array,
    }),
    lang: React.PropTypes.string,
    suggestions: React.PropTypes.array,
    loading: React.PropTypes.bool,
  }

  componentDidMount() {
    this.props.dispatch(lookupWord())
    this.refs.search.focus()
  }

  onLanguageChange = (event) => {
    const lang = event.target.value
    this.props.dispatch(changeLanguage(lang))
    this.props.dispatch(lookupWord())
  }

  setCurrentForm = (current) => {
    const { dispatch, word } = this.props

    dispatch(changeRoute(current.form, {
      id: word.result.binId,
      tag: current.grammarTag,
    }))
    dispatch(selectWord())

    if (!isMobile) {
      this.refs.search.focus()
    }
  }

  setCurrent = (result) => {
    const { dispatch, location } = this.props
    dispatch(changeRoute(location.query, { id: result.binId }))
    dispatch(lookupWord())
  }

  setSuggestion = (suggestion) => {
    this.props.dispatch(changeRoute(suggestion))
    this.props.dispatch(lookupWord())
  }

  // getCases() {
  //   if (isVerb(bestMatch)) {
  //     api.lookupCases(bestMatch.headWord)
  //       .then(({ data: cases }) => this.setState({ cases }))
  //   } else {
  //     this.setState({ cases: null })
  //   }
  // }

  queryChanged = (event) => {
    this.props.dispatch(changeRoute(event.target.value))
    this.props.dispatch(lookupWord())
  }

  render() {
    const { location, lang, suggestions, loading } = this.props
    const { query } = location
    const { result, current, otherMatches } = this.props.word
    const { cases } = {}
    const t = translations[lang]

    return (
      <TranslatorProvider translations={t}>
        <div className={styles.root}>
          <div className={styles.content}>
            <Logo />
            <input
              ref="search"
              type="text"
              className={styles.search}
              value={query}
              onChange={this.queryChanged}
              placeholder={t.ui['search-for-an-icelandic-word']}
              autoCapitalize="none"
            />
            <Loader loading={loading} />
            {result && <div>
              <span className={styles.headWord}>{result.headWord}</span>
              <span className={styles.wordClass}>{result.wordClass}</span>

              <Cases cases={cases} headWord={result.headWord} />
            </div>}

            {query && <div>
              <Results result={result} current={current} setCurrentForm={this.setCurrentForm} />
              <SeeAlso result={result} otherMatches={otherMatches} setCurrent={this.setCurrent} />
              <Suggestions suggestions={suggestions} navigate={this.setSuggestion} />
            </div>}

            <LanguagePicker lang={lang} onChange={this.onLanguageChange} />
          </div>
          <Footer />
        </div>
      </TranslatorProvider>
    )
  }
}

export default connect(({ word, suggestions, lang, location, loading }) =>
  ({ word, suggestions, lang, location, loading }))(Main)
