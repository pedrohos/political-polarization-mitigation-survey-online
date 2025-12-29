import React from "react";
// import PasswordField from "./PasswordField";
import InterestsMatrix from "./InterestsMatrix";
import PoliticalLeaning from "./PoliticalLeaning";

interface IndexProps {
    // handlePassword: (password: string) => void;
    handleInterestsMatrix: (rowIdx: number, score: number) => void;
    handlePoliticalLeaning: (score: number) => void;

    prolificId: string;
}

export default function Index(props: IndexProps) {
    return (
        <div className="intro-wrapper">
            <h3 className="section-title">Mapeamento de Perfil</h3>
            <div className="questions-section">
                <div className="question-block-new" style={{ marginTop: '-1rem' }}>
                    {/* <PasswordField changeHandler={props.handlePassword} disabled={isDisabled} /> */}
                    <PoliticalLeaning changeHandler={props.handlePoliticalLeaning} />
                </div>
                <div className="question-block-new">
                    <InterestsMatrix changeHandler={props.handleInterestsMatrix} />
                </div>
            </div>
        </div>
    );
}