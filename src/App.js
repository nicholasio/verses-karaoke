import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Speech from './components/Speech';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Karaoquê de Versículo</h1>
					<p>
						Desenvolvido por{' '}
						<a href="https://blog.nicholasandre.com.br/" target="_blank" rel="noopener noreferrer">
							Nícholas André
						</a>
					</p>
				</header>

				<div className="container">
					<Speech />
				</div>
			</div>
		);
	}
}

export default App;
