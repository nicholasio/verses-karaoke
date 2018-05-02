import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { diffWords } from 'diff';
import removeAccents from 'remove-accents';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import mic from './mic.svg';
import db from '../data/db';
import dbTravaLingua from '../data/db-trava-lingua';
import dbEnglish from '../data/db-english';
import recordAudio from '../utils/recordAudio';
import speaker from './speaker.svg';
import './Speech.css';
import recordingIcon from './mic-animate.gif';
import { linebreak, capitalize, removePunctuaction, countWords } from '../utils/text';

class Speech extends Component {
	constructor(props) {
		super(props);
		this.recognition = null;
		this.finalSpan = React.createRef();
		this.interimSpan = React.createRef();
		this.sourceText = React.createRef();

		this.tick = this.tick.bind(this);
		this.starTimer = this.starTimer.bind(this);
		this.stopTimer = this.stopTimer.bind(this);
		this.resetTimer = this.resetTimer.bind(this);
		this.toggleRecording = this.toggleRecording.bind(this);
		this.dropdownOnChange = this.dropdownOnChange.bind(this);
	}
	state = {
		recognizing: false,
		language: 'pt-BR',
		elapsed: 0,
		finalTranscript: '',
		scoreErrors: 0,
		score: 0,
		diffResult: '',
		timerStart: 0, // eslint-disable-line
		timerRunning: false, // eslint-disable-line
	};

	async componentDidMount() {
		// eslint-disable-next-line
        this.recognition = new webkitSpeechRecognition();

		this.recognition.continuous = false;
		this.recognition.interimResults = true;

		// this.recognition.onstart = this.recognitionOnStart.bind(this);
		// this.recognition.onerror = this.recognitionOnError.bind(this);
		this.recognition.onend = this.recognitionOnEnd.bind(this);
		this.recognition.onresult = this.recognitionOnResult.bind(this);
		this.recorder = await recordAudio();
		this.audio = null;
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	onLanguageChange = option => {
		this.setState({ language: option.value });
		console.log(`changing language to ${option.value}`);
	};

	recognitionOnEnd() {
		// if it's not a continuous recognition we need to stop recording
		if (!this.recognition.continuous) {
			this.toggleRecording();
		}
		this.diffText(this.sourceText.current.value, this.state.finalTranscript);
	}
	recognitionOnResult(evt) {
		if (typeof evt.results === 'undefined') {
			this.recognition.onend = null;
			this.recognition.stop();
			return;
		}
		let interimTranscript = '';
		let finalTranscript = '';

		for (let i = evt.resultIndex; i < evt.results.length; ++i) {
			if (evt.results[i].isFinal) {
				finalTranscript += evt.results[i][0].transcript;
			} else {
				interimTranscript += evt.results[i][0].transcript;
			}
		}
		finalTranscript = capitalize(finalTranscript);
		this.setState({ finalTranscript });
		this.finalSpan.current.innerHTML = linebreak(finalTranscript);
		this.interimSpan.current.innerHTML = linebreak(interimTranscript);
	}
	diffText = (source, target) => {
		const diff = diffWords(
			removePunctuaction(removeAccents(source)),
			removePunctuaction(removeAccents(target)),
			{
				ignoreCase: true,
			},
		);
		let diffResult = '';
		let scoreErrors = 0;
		diff.forEach(part => {
			const color = part.added ? 'grey' : part.removed ? 'red' : 'green'; // eslint-disable-line
			if (color === 'red') {
				scoreErrors += countWords(part.value);
			}
			diffResult = `${diffResult} <span class="diff-${color}">${part.value}</span>`;
		});
		const elapsed = Math.round(this.state.elapsed / 100);
		const seconds = (elapsed / 10).toFixed(1);
		const nWords = countWords(source);
		const maxScore = nWords * 10;
		let score = maxScore - scoreErrors / nWords * maxScore - seconds * 3;
		if (score < 0) {
			score = 0;
		}
		score = (maxScore - (maxScore - score / maxScore)) * 100;
		this.setState({ diffResult, scoreErrors, score });
	};

	async toggleRecording(evt) {
		if (this.state.recognizing) {
			this.setState({ recognizing: false });
			this.recognition.stop();
			this.stopTimer();
			this.audio = await this.recorder.stop();
		} else {
			this.setState({ recognizing: true });
			this.recognition.lang = this.state.language;
			this.recognition.start();
			this.starTimer();
			this.recorder.start();
		}
	}

	tick() {
		this.setState(({ elapsed, timerStart }) => ({ elapsed: new Date() - timerStart }));
	}

	starTimer() {
		this.setState(
			({ timerStart }) => ({ timerStart: Date.now(), timerRunning: true }),
			() => {
				this.timer = setInterval(() => this.tick(), 50);
			},
		);
	}

	stopTimer() {
		this.setState(
			({ timerStart }) => ({ timerRunning: false }),
			() => {
				clearInterval(this.timer);
			},
		);
	}

	resetTimer() {
		this.setState(({ timerStart }) => ({ timerStart: 0, timerRunning: false }));
	}

	dropdownOnChange(option) {
		this.sourceText.current.value = option.value;
	}
	render() {
		const elapsed = Math.round(this.state.elapsed / 100);
		const seconds = (elapsed / 10).toFixed(1);
		const ptVerses = Object.keys(db).map(i => ({ value: db[i], label: i }));
		const travaLinguas = Object.keys(dbTravaLingua).map(i => ({
			value: dbTravaLingua[i],
			label: i,
		}));
		const enVerses = Object.keys(dbEnglish).map(i => ({
			value: dbEnglish[i],
			label: i,
		}));
		const languages = [{ value: 'pt-BR', label: 'Português' }, { value: 'en-US', label: 'Inglês' }];
		return (
			<div>
				<div className="sources">
					<Dropdown
						options={ptVerses}
						placeholder="Selecione um Versísulo em Português"
						onChange={this.dropdownOnChange}
					/>
					<Dropdown
						options={enVerses}
						placeholder="Ou Selecione um Versísulo em Inglês"
						onChange={this.dropdownOnChange}
					/>
					<Dropdown
						options={travaLinguas}
						placeholder="Ou Selecione um Trava Língua"
						onChange={this.dropdownOnChange}
					/>
				</div>

				<div className="sourceContainer">
					<textarea ref={this.sourceText} className="textToBeSpoken" />
					<div className="diffResult">
						<span dangerouslySetInnerHTML={{ __html: this.state.diffResult }} />
					</div>
				</div>
				<div className="recordContainer">
					<div id="div_start">
						<button id="start_button" onClick={evt => this.toggleRecording(evt)}>
							<img
								alt="Start"
								id="start_img"
								src={this.state.recognizing ? recordingIcon : mic}
								width="30px"
							/>
						</button>
						<button
							onClick={() => {
								if (this.audio) {
									this.audio.play();
								}
							}}
							id="listen_button"
						>
							<img alt="Escutar Gravação" src={speaker} width="30px" />
						</button>
					</div>
					<div id="results">
						<span className="final" id="final_span" ref={this.finalSpan}>
							{this.props.final_result}
						</span>
						<span className="interim" id="interim_result" ref={this.interimSpan}>
							{this.props.interim_result}
						</span>
					</div>
					<div className="summary">
						<div className="timer">
							{seconds} Segundos. Erros: {this.state.scoreErrors} Pontuação:
							{this.state.score.toFixed(2)}%
						</div>
					</div>
					<div className="languages_list">
						<label htmlFor="mode">
							<input
								id="mode"
								type="checkbox"
								onClick={() => {
									this.recognition.continuous = !this.recognition.continuous;
								}}
							/>
							Modo Contínuo *
						</label>
						<Dropdown
							options={languages}
							onChange={this.onLanguageChange}
							placeholder="Seleciona o Idioma"
						/>
					</div>
					<p>
						* Ative este modo para parar o reconhecimento manualmente (clicando no microfone), útil
						para quando o reconhecimento para prematuramente
					</p>
				</div>
			</div>
		);
	}
}

Speech.propTypes = {
	final_result: PropTypes.string,
	interim_result: PropTypes.string,
};

Speech.defaultProps = {
	final_result: '',
	interim_result: '',
};

export default Speech;
