interface PasswordFieldProps {
    changeHandler: (password: string) => void;
    disabled?: boolean;
}

export default function PasswordField(props: PasswordFieldProps) {
    return (
        <div>
            <div className="div-p">
                Usuários do Prolific não precisam preencher este campo.
                <br/>
                Por favor, preencha uma senha aleatória para evitar duplicidade de respostas entre os participantes. Caso você perca conexão, é possível retomar o preenchimento utilizando a mesma senha preenchida anteriormente.
            </div>
            
            <div id="password-field">
                <label className="password-field label">Senha:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder=""
                    disabled={props.disabled}
                    onChange={(e) => props.changeHandler(e.target.value)}
                />
            </div>
        </div>
    );
}