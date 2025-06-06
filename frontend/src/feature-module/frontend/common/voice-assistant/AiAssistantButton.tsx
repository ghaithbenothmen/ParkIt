import React, { useState, useEffect, useRef } from 'react';
import { useAiAssistant } from './AiAssistantContext';
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';
import { GiBrainFreeze } from 'react-icons/gi';
import { Toast } from 'primereact/toast';

const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes bounce {
            0%, 100% { transform: scale(0.7); }
            50% { transform: scale(1.2); }
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.6); }
            100% { box-shadow: 0 0 0 30px rgba(255, 255, 255, 0); }
        }
        @keyframes attention {
            0%, 50%, 100% { background-color: #4a6cf6; }
            25%, 75% { background-color: rgba(255, 255, 255, 0.7); }
        }
        .ai-assistant-button {
            width: 75px;
            height: 75px;
            font-size: 35px;
            color: #ffffff;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            border: none;
            box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.7);
            transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
            position: fixed;

            bottom: 40px;

            right: 75px;
            z-index: 9999;
        }
        .ai-assistant-button.attention {
            animation: attention 1s 2;
        }
        .ai-assistant-button:hover {
            border: 1px solid #fff;
        }
        @media (max-width: 768px) {
            .ai-assistant-button {
                width: 65px;
                height: 65px;
                font-size: 30px;
                bottom: 25px;
                right: 25px;
            }
        }
    `;
    document.head.appendChild(style);
};

type RecordingState =
    | 'STATE_IDLE'
    | 'STATE_LISTENING_START'
    | 'STATE_THINKING_START'
    | 'STATE_SPEAKING_START'
    | 'STATE_FREEZING';

type StateColors = {
    [state in RecordingState]?: string;
};

interface AiAssistantButtonProps {
    stateColors?: StateColors;
    style?: any;
    onClick?: () => void;
    toastRef?: React.RefObject<Toast>;
    [key: string]: any;
}

const AiAssistantButton: React.FC<AiAssistantButtonProps> = ({
    stateColors = {},
    style = {},
    onClick,
    toastRef,
    ...props
}) => {
    const { aiAssistant } = useAiAssistant();
    const [recordingState, setRecordingState] =
        useState<RecordingState>('STATE_IDLE');
    const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false);
    const [hover, setHover] = useState<boolean>(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        injectStyles();
    }, []);

    const defaultStateColors: StateColors = {
        STATE_IDLE: '#4a6cf6',
        STATE_LISTENING_START: '#F64A7B',
        STATE_THINKING_START: '#015589',
        STATE_SPEAKING_START: '#019a9a',
        STATE_FREEZING: '#3c4559',
    };

    const colors: StateColors = { ...defaultStateColors, ...stateColors };

    const handleButtonClick = () => {
        if (aiAssistant) {
            aiAssistant.startProcessing();
        }
        if (onClick) {
            onClick();
        }
    };

    useEffect(() => {
        if (aiAssistant) {
            const handleStateChange = (newState: string) => {
                setRecordingState(newState as RecordingState);
                setButtonDisabled(
                    newState === 'STATE_LISTENING_START' ||
                        newState === 'STATE_THINKING_START' ||
                        newState === 'STATE_FREEZING',
                );
            };

            const handleToast = (message: string) => {
                if (toastRef && toastRef.current) {
                    toastRef.current.show({
                        severity: 'success',
                        summary: 'AI Assistant',
                        detail: message,
                        life: 3000,
                    });
                }
            };

            aiAssistant.on('stateChange', handleStateChange);
            aiAssistant.on('toast', handleToast);

            return () => {
                aiAssistant.off('stateChange', handleStateChange);
                aiAssistant.off('toast', handleToast);
            };
        }
    }, [aiAssistant, toastRef]);

    useEffect(() => {
        if (buttonRef.current) {
            buttonRef.current.classList.add('attention');

            const animationEndHandler = () => {
                if (buttonRef.current) {
                    buttonRef.current.classList.remove('attention');
                }
            };

            buttonRef.current.addEventListener('animationend', animationEndHandler);

            return () => {
                if (buttonRef.current) {
                    buttonRef.current.removeEventListener('animationend', animationEndHandler);
                }
            };
        }
    }, []);

    return (
        <button
            ref={buttonRef}
            className="ai-assistant-button"
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                backgroundColor: colors[recordingState],
                boxShadow: hover
                    ? '0px 0px 10px #4a6cf6'
                    : '0px 0px 15px rgba(0, 0, 0, 0.9)',
                animation:
                    recordingState === 'STATE_LISTENING_START'
                        ? 'spin 2s infinite'
                        : recordingState === 'STATE_THINKING_START'
                        ? 'bounce 2s infinite'
                        : recordingState === 'STATE_SPEAKING_START'
                        ? 'pulse 1.5s infinite'
                        : '',
                ...style,
            }}
            {...props}
        >
            {recordingState === 'STATE_THINKING_START' ? (
                <GiBrainFreeze />
            ) : recordingState === 'STATE_SPEAKING_START' ? (
                <FaVolumeUp />
            ) : (
                <FaMicrophone />
            )}
        </button>
    );
};

export { AiAssistantButton };
