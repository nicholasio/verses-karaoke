import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { diffWords } from 'diff';
import removeAccents from 'remove-accents';
import LanguageDropdown from './LanguageDropdown';
import mic from './mic.svg';
import stop from './stop.svg';

import './Speech.css';

function linebreak(s) {
	const twoLine = /\n\n/g;
	const oneLine = /\n/g;
	return s.replace(twoLine, '<p></p>').replace(oneLine, '<br>');
}

function capitalize(s) {
	const firstChar = /\S/;
	return s.replace(firstChar, m => m.toUpperCase());
}

function removePunctuaction(str) {
	return str.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');
}

class Speech extends Component {
	constructor(props) {
		super(props);
		this.recognition = null;
		this.finalSpan = React.createRef();
		this.interimSpan = React.createRef();
		this.sourceText = React.createRef();

		this.tick.bind(this);
		this.starTimer.bind(this);
		this.stopTimer.bind(this);
		this.resetTimer.bind(this);
		this.toggleRecording.bind(this);
	}
	state = {
		recognizing: false,
		language: 'pt-BR',
		elapsed: 0,
		finalTranscript: '',
		scoreErrors: 0,
		diffResult: '',
		timerStart: 0, // eslint-disable-line
		timerRunning: false, // eslint-disable-line
	};

	componentDidMount() {
		// eslint-disable-next-line
        this.recognition = new webkitSpeechRecognition();

		this.recognition.continuous = false;
		this.recognition.interimResults = true;

		this.recognition.onstart = this.recognitionOnError.bind(this);
		this.recognition.onerror = this.recognitionOnStart.bind(this);
		this.recognition.onend = this.recognitionOnEnd.bind(this);
		this.recognition.onresult = this.recognitionOnResult.bind(this);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	onLanguageChange = language => {
		this.setState({ language });
		console.log(`changing language to ${language}`);
	};

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
				scoreErrors += 1;
			}
			diffResult = `${diffResult} <span class="diff-${color}">${part.value}</span>`;
		});
		this.setState({ diffResult, scoreErrors });
	};
	toggleRecording(evt) {
		if (this.state.recognizing) {
			this.setState({ recognizing: false });
			this.recognition.stop();
			this.stopTimer();
			this.diffText(this.sourceText.current.value, this.state.finalTranscript);
		} else {
			this.setState({ recognizing: true });
			this.recognition.lang = this.state.language;
			this.recognition.start();
			this.starTimer();
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
	recognitionOnError(evt) {
		// this.setState({ recognizing: false });
		console.log('error', evt);
	}
	recognitionOnStart() {
		console.log('starting');
	}
	recognitionOnEnd() {
		// update this
		console.log('on end');
		this.toggleRecording();
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

	render() {
		const elapsed = Math.round(this.state.elapsed / 100);
		const seconds = (elapsed / 10).toFixed(1);
		const recordingIcon = '/mic-animate.gif';
		return (
			<div>
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
							{seconds} Segundos. Erros: {this.state.scoreErrors}
						</div>

						<button
							className="stopTimer"
							onClick={e => {
								this.stopTimer();
							}}
							href="#"
						>
							<img src={stop} alt="Parar" width="32px" />
						</button>
					</div>
					<div className="languages_list">
						<LanguageDropdown onChange={this.onLanguageChange} />
					</div>
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
