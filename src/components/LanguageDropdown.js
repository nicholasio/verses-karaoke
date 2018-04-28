import React from 'react';
import PropTypes from 'prop-types';

const LanguageDropdown = ({ onChange }) => (
	<form id="languages">
		<label htmlFor="select_language">
			Idioma:
			<select id="select_language" onChange={evt => onChange(evt.target.value)}>
				<option value="pt-BR">Português</option>
				<option value="en-US">English</option>
			</select>
		</label>
	</form>
);

LanguageDropdown.propTypes = {
	onChange: PropTypes.func.isRequired,
};

export default LanguageDropdown;
