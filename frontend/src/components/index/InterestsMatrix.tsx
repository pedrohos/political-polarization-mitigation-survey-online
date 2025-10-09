interface ParticipantInterestsProps {
    changeHandler: (rowIdx: number, score: number) => void;
    values?: number[]; // optional controlled values per category (1..5)
}

const SCALES = {
    likert: {
        labels: ["1", "2", "3", "4", "5"],
        values: [1, 2, 3, 4, 5],
    },
};

export default function ParticipantInterests(props: ParticipantInterestsProps) {
    const categories = [
        'Alimentação & Gastronomia',
        'Ciência & Tecnologia',
        'Costumes',
        'Economia',
        'Educação',
        'Entretenimento & Cultura Pop',
        'Esportes',
        'Geopolítica & Relações Internacionais',
        'Justiça Social',
        'Meio Ambiente',
        'Negócios & Empreendedorismo',
        'Política',
        'Religião',
        'Saúde & Bem-estar',
        'Segurança & Crime',
        'Transporte & Mobilidade',
        'Outros'
    ];

    return (
        <div className="question-block">
            <p className="question-text">
                Qual o seu nível de consumo de notícias com os seguintes temas? (1 = Nenhum consumo, 5 = Muito consumo)
            </p>

            <table className="matrix-table">
                <thead>
                    <tr>
                        <th></th>
                        {SCALES.likert.labels.map((label, index) => (
                            <th key={index} dangerouslySetInnerHTML={{ __html: label }} />
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category, rowIndex) => (
                        <tr key={rowIndex}>
                            <td>{category}</td>
                            {SCALES.likert.values.map((val) => (
                                <td key={val}>
                                    <input
                                        type="radio"
                                        name={`interest-${rowIndex}`}
                                        value={val}
                                        {...(props.values
                                            ? { checked: props.values[rowIndex] === val }
                                            : {})}
                                        onChange={() => props.changeHandler(rowIndex, val)}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}