interface PoliticalLeaningProps {
    changeHandler: (leaning: number) => void;
}

const SCALE = {
    labels: [
        "Esquerda radical",
        "Esquerda",
        "Centro-esquerda",
        "Centro",
        "Centro-direita",
        "Direita",
        "Extrema-direita",
        "Não sei / Ignorar"
    ],
    values: [1, 2, 3, 4, 5, 6, 7, 8]
}

function PoliticalLeaningOptions({ props }: { props: PoliticalLeaningProps }) {
    return (
        <div
            className="scale-grid-new"
            style={{ ["--cols" as any]: SCALE.values.length }}
        >
            {SCALE.labels.map((label, index) => {
                const value = SCALE.values[index];
                return (
                    <div key={value} className="scale-col">
                        <div
                            className={'scale-label-new'}
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                        <div
                            className={`scale-opt-new ${value % 2 === 0 ? 'tone-alt' : ''}`}
                        >
                            <input
                                type="radio"
                                name="political-leaning"
                                value={value}
                                onChange={() => props.changeHandler(value)}
                            />

                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default function PoliticalLeaning(props: PoliticalLeaningProps) {
    return (
        <div className="question-block">
            <p className="question-text">{`Qual das seguintes opções melhor define seu posicionamento político?`}</p>
            <PoliticalLeaningOptions
                props={props} />
          </div>
    )    
}