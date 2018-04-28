export default () =>
	new Promise(resolve => {
		window.navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
			const mediaRecorder = new window.MediaRecorder(stream);
			let audioChunks = [];
			let audioId = 0;
			mediaRecorder.addEventListener('dataavailable', event => {
				audioChunks.push(event.data);
			});

			const start = () => {
				audioChunks = [];
				mediaRecorder.start();
			};

			const stop = () =>
				new Promise(resolve => { // eslint-disable-line
					mediaRecorder.addEventListener('stop', () => {
						audioId += 1;

						const audioBlob = new window.Blob(audioChunks);
						const audioUrl = URL.createObjectURL(audioBlob);
						const audio = new window.Audio(audioUrl);

						window.localStorage.setItem(`audio-${audioId}`, window.btoa(audioChunks));
						const play = () => {
							audio.play();
						};

						resolve({ audioBlob, audioUrl, play });
					});

					mediaRecorder.stop();
				});

			resolve({ start, stop });
		});
	});
