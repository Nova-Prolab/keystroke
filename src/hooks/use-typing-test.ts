
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/contexts/i18nContext';

// Expanded sample texts for each language
const ALL_SAMPLE_TEXTS: Record<string, string[]> = {
  en: [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
    "Programming is the art of telling another human being what one wants the computer to do. The purpose of software engineering is to control complexity, not to create it.",
    "In the midst of chaos, there is also opportunity. The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. The only way to do great work is to love what you do.",
    "The journey of a thousand miles begins with a single step. Never underestimate the power of dreams and the influence of the human spirit.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. Believe you can and you're halfway there.",
    "What you get by achieving your goals is not as important as what you become by achieving your goals. Act as if what you do makes a difference. It does.",
    "Life is like riding a bicycle. To keep your balance, you must keep moving. The only limit to our realization of tomorrow will be our doubts of today.",
    "The future belongs to those who believe in the beauty of their dreams. It always seems impossible until it's done. Try to be a rainbow in someone's cloud.",
    "Keep your face always toward the sunshine, and shadows will fall behind you. You will face many defeats in life, but never let yourself be defeated.",
    "The only source of knowledge is experience. Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.",
    "Strive not to be a success, but rather to be of value. Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    "If you want to live a life happy, tie it to a goal, not to people or things. The mind is everything. What you think you become.",
    "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma – which is living with the results of other people's thinking.",
    "The best way to predict the future is to create it. People who are crazy enough to think they can change the world are the ones who do.",
    "An unexamined life is not worth living. Whereof one cannot speak, thereof one must be silent. The limits of my language mean the limits of my world.",
    "Happiness is not something readymade. It comes from your own actions. The purpose of our lives is to be happy. Get busy living or get busy dying.",
    "You only live once, but if you do it right, once is enough. To live is the rarest thing in the world. Most people exist, that is all.",
    "Good friends, good books, and a sleepy conscience: this is the ideal life. The truth is rarely pure and never simple.",
    "It is never too late to be what you might have been. Do what you can, with what you have, where you are. Be the change that you wish to see in the world.",
    "The only thing we have to fear is fear itself. We hold these truths to be self-evident, that all men are created equal.",
    "Ask not what your country can do for you – ask what you can do for your country. Government of the people, by the people, for the people, shall not perish from the Earth.",
    "I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.",
    "Stay hungry. Stay foolish. Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    "Innovation distinguishes between a leader and a follower. Sometimes when you innovate, you make mistakes. It is best to admit them quickly, and get on with improving your other innovations."
  ],
  es: [
    "El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja. ¡Qué fácil es escribir en español ahora!",
    "Programar es el arte de decirle a otro ser humano lo que uno quiere que haga la computadora. El propósito de la ingeniería de software es controlar la complejidad, no crearla.",
    "En medio del caos, también hay oportunidad. La mayor gloria de vivir no consiste en no caer nunca, sino en levantarse cada vez que caemos.",
    "Ser tú mismo en un mundo que constantemente intenta convertirte en otra cosa es el mayor logro. La única forma de hacer un gran trabajo es amar lo que haces.",
    "El camino de mil millas comienza con un solo paso. Nunca subestimes el poder de los sueños y la influencia del espíritu humano.",
    "El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el coraje para continuar. Cree que puedes y estarás a medio camino.",
    "Lo que obtienes al alcanzar tus metas no es tan importante como en lo que te conviertes al alcanzar tus metas. Actúa como si lo que haces marcara la diferencia. Lo hace.",
    "La vida es como andar en bicicleta. Para mantener el equilibrio, debes seguir moviéndote. El único límite para nuestra realización del mañana serán nuestras dudas de hoy.",
    "El futuro pertenece a quienes creen en la belleza de sus sueños. Siempre parece imposible hasta que se hace. Intenta ser un arcoíris en la nube de alguien.",
    "Mantén tu rostro siempre hacia el sol, y las sombras caerán detrás de ti. Enfrentarás muchas derrotas en la vida, pero nunca te dejes derrotar.",
    "La única fuente de conocimiento es la experiencia. La imaginación es más importante que el conocimiento. El conocimiento es limitado. La imaginación rodea el mundo.",
    "No te esfuerces por ser un éxito, sino por ser de valor. Dos cosas son infinitas: el universo y la estupidez humana; y no estoy seguro sobre el universo.",
    "Si quieres vivir una vida feliz, átala a una meta, no a personas o cosas. La mente lo es todo. En lo que piensas te conviertes.",
    "Tu tiempo es limitado, así que no lo desperdicies viviendo la vida de otra persona. No te dejes atrapar por el dogma, que es vivir con los resultados Del pensamiento de Otras gentes.",
    "La mejor manera de predecir el futuro es crearlo. Las personas que están lo suficientemente locas como para pensar que pueden cambiar el mundo son las que lo hacen.",
    "Una vida sin examinar no vale la pena vivirla. De lo que no se puede hablar, hay que callar. Los límites de mi lenguaje significan los límites de mi mundo.",
    "La felicidad no es algo ya hecho. Viene de tus propias acciones. El propósito de nuestras vidas es ser felices. Ocúpate viviendo o ocúpate muriendo.",
    "Solo se vive una vez, pero si lo haces bien, una vez es suficiente. Vivir es la cosa más rara del mundo. La mayoría de la gente existe, eso es todo.",
    "Buenos amigos, buenos libros y una conciencia tranquila: esta es la vida ideal. La verdad rara vez es pura y nunca simple.",
    "Nunca es demasiado tarde para ser lo que podrías haber sido. Haz lo que puedas, con lo que tengas, donde estés. Sé el cambio que deseas ver en el mundo.",
    "Lo único que debemos temer es al propio temor. Sostenemos como evidentes estas verdades: que todos los hombres son creados iguales.",
    "No preguntes qué puede hacer tu país por ti, pregunta qué puedes hacer tú por tu país. El gobierno del pueblo, por el pueblo y para el pueblo, no desaparecerá de la faz de la Tierra.",
    "Tengo un sueño: que mis cuatro hijos pequeños vivirán un día en una nación donde no serán juzgados por el color de su piel sino por el contenido de su carácter.",
    "Sigue hambriento. Sigue alocado. Tu trabajo va a llenar gran parte de tu vida, y la única forma de estar realmente satisfecho es hacer lo que crees que es un gran trabajo.",
    "La innovación distingue a un líder de un seguidor. A veces, cuando innovas, cometes errores. Es mejor admitirlos rápidamente y seguir mejorando tus otras innovaciones."
  ],
  pt: [
    "A rápida raposa marrom salta sobre o cão preguiçoso. Leve uísque Fagundes para casa hoje à noite. Zebras caolhas de Java querem passar num pequeno túnel.",
    "Programar é a arte de dizer a outro ser humano o que se quer que o computador faça. O propósito da engenharia de software é controlar a complexidade, não criá-la.",
    "No meio do caos, há também oportunidade. A maior glória de viver não reside em nunca cair, mas em nos levantarmos sempre que caímos.",
    "Ser você mesmo em um mundo que está constantemente tentando fazer de você outra coisa é a maior realização. A única maneira de fazer um ótimo trabalho é amar o que você faz.",
    "A jornada de mil milhas começa com um único passo. Nunca subestime o poder dos sonhos e a influência do espírito humano.",
    "O sucesso não é final, o fracasso não é fatal: é a coragem de continuar que conta. Acredite que você pode e você já está no meio do caminho.",
    "O que você conquista ao alcançar seus objetivos não é tão importante quanto o que você se torna ao alcançar seus objetivos. Aja como se o que você faz fizesse a diferença. Faz.",
    "A vida é como andar de bicicleta. Para manter o equilíbrio, você deve continuar se movendo. O único limite para a nossa realização do amanhã serão as nossas dúvidas de hoje.",
    "O futuro pertence àqueles que acreditam na beleza de seus sonhos. Sempre parece impossível até que seja feito. Tente ser um arco-íris na nuvem de alguém.",
    "Mantenha seu rosto sempre em direção ao sol, e as sombras cairão atrás de você. Você enfrentará muitas derrotas na vida, mas nunca se deixe derrotar.",
    "A única fonte de conhecimento é a experiência. A imaginação é mais importante que o conhecimento. O conhecimento é limitado. A imaginação circunda o mundo.",
    "Não se esforce para ser um sucesso, mas sim para ser de valor. Duas coisas são infinitas: o universo e a estupidez humana; e não tenho certeza sobre o universo.",
    "Se você quer viver uma vida feliz, ligue-a a um objetivo, não a pessoas ou coisas. A mente é tudo. Aquilo que você pensa, você se torna.",
    "Seu tempo é limitado, então não o desperdice vivendo a vida de outra pessoa. Não seja pego pelo dogma – que é viver com os resultados do pensamento de outras pessoas.",
    "A melhor maneira de prever o futuro é criá-lo. Pessoas que são loucas o suficiente para achar que podem mudar o mundo são aquelas que o fazem.",
    "Uma vida não examinada não vale a pena ser vivida. Sobre aquilo de que não se pode falar, deve-se calar. Os limites da minha linguagem significam os limites do meu mundo.",
    "A felicidade não é algo pronto. Ela vem de suas próprias ações. O propósito de nossas vidas é ser feliz. Ocupe-se vivendo ou ocupe-se morrendo.",
    "Você só vive uma vez, mas se fizer direito, uma vez é o suficiente. Viver é a coisa mais rara do mundo. A maioria das pessoas existe, isso é tudo.",
    "Bons amigos, bons livros e uma consciência sonolenta: esta é a vida ideal. A verdade raramente é pura e nunca simples.",
    "Nunca é tarde demais para ser o que você poderia ter sido. Faça o que puder, com o que você tem, onde você está. Seja a mudança que você deseja ver no mundo.",
    "A única coisa que devemos temer é o próprio medo. Consideramos estas verdades como autoevidentes, que todos os homens são criados iguais.",
    "Não pergunte o que seu país pode fazer por você – pergunte o que você pode fazer por seu país. O governo do povo, pelo povo, para o povo, não perecerá da Terra.",
    "Eu tenho um sonho de que meus quatro filhos pequenos um dia viverão em uma nação onde não serão julgados pela cor de sua pele, mas pelo conteúdo de seu caráter.",
    "Continue faminto. Continue tolo. Seu trabalho vai preencher uma grande parte da sua vida, e a única maneira de estar verdadeiramente satisfeito é fazer o que você acredita ser um ótimo trabalho.",
    "A inovação distingue um líder de um seguidor. Às vezes, quando você inova, comete erros. É melhor admiti-los rapidamente e continuar melhorando suas outras inovações."
  ],
};


export type Keystroke = {
  char: string;
  timestamp: number;
  inputChar: string;
  status: 'correct' | 'incorrect' | 'corrected';
};

export type ErrorRecord = {
  expected: string;
  actual: string;
  index: number;
};

export type TypingStats = {
  wpm: number;
  cpm: number;
  accuracy: number;
  timeElapsed: number; // in seconds
  errorCount: number;
  wordsTyped: number;
  charsTyped: number;
  correctChars: number;
  errorRate: number;
};

export type FormattedCharacter = {
  char: string;
  className: string;
  key: string;
  actualChar?: string;
  originalIndex: number;
};

const getNewSampleText = (locale: string): string => {
  const textsForLocale = ALL_SAMPLE_TEXTS[locale] || ALL_SAMPLE_TEXTS['en'];
  return textsForLocale[Math.floor(Math.random() * textsForLocale.length)];
};

const initialStats: TypingStats = {
  wpm: 0,
  cpm: 0,
  accuracy: 100,
  timeElapsed: 0,
  errorCount: 0,
  wordsTyped: 0,
  charsTyped: 0,
  correctChars: 0,
  errorRate: 0,
};

export function useTypingTest() {
  const { locale, isInitialized: i18nInitialized } = useI18n();
  
  const [sampleText, setSampleText] = useState<string>("");
  const [typedText, setTypedText] = useState<string>("");
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTimeState] = useState<number | null>(null);
  
  const [stats, setStats] = useState<TypingStats>(initialStats);
  const [keystrokeHistory, setKeystrokeHistory] = useState<Keystroke[]>([]);
  const [errors, setErrors] = useState<ErrorRecord[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (i18nInitialized) {
      setSampleText(getNewSampleText(locale));
    }
  }, [locale, i18nInitialized]);


  const resetTest = useCallback(() => {
    setSessionActive(false);
    setTypedText("");
    setStartTime(null);
    setEndTimeState(null);
    setStats(initialStats);
    setKeystrokeHistory([]);
    setErrors([]);
    if (i18nInitialized) {
      setSampleText(getNewSampleText(locale));
    }
    if (inputRef.current) {
       inputRef.current.focus();
    }
  }, [locale, i18nInitialized]);

  const startTest = useCallback(() => {
    if (sessionActive) return;
    resetTest(); 
    setSessionActive(true);
    setStartTime(Date.now());
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [resetTest, sessionActive]);
  

  useEffect(() => {
    if (!sessionActive || !startTime || !sampleText) return;

    const calculateStats = () => {
      const now = endTime || Date.now(); 
      const timeElapsedSeconds = (now - startTime) / 1000;
      if (timeElapsedSeconds <= 0) return;

      let currentCorrectChars = 0;
      for (let i = 0; i < typedText.length && i < sampleText.length; i++) {
        if (typedText[i] === sampleText[i]) {
          currentCorrectChars++;
        }
      }
      
      const currentCharsTyped = typedText.length;
      const currentWordsTyped = typedText.split(' ').filter(Boolean).length;
      const currentCpm = Math.round((currentCorrectChars / timeElapsedSeconds) * 60) || 0;
      const currentWpm = Math.round(currentCpm / 5) || 0; 
      const currentAccuracy = currentCharsTyped > 0 ? Math.round((currentCorrectChars / currentCharsTyped) * 100) : 100;
      const currentErrorCount = errors.length;
      const currentErrorRate = sampleText.length > 0 ? parseFloat(((currentErrorCount / sampleText.length) * 100).toFixed(2)) : 0;


      setStats({ 
        wpm: currentWpm, 
        cpm: currentCpm, 
        accuracy: currentAccuracy, 
        timeElapsed: parseFloat(timeElapsedSeconds.toFixed(1)),
        errorCount: currentErrorCount,
        wordsTyped: currentWordsTyped,
        charsTyped: currentCharsTyped,
        correctChars: currentCorrectChars,
        errorRate: currentErrorRate,
      });
    };

    if (typedText.length >= sampleText.length && !endTime) { // Check >= in case of overtyping (if allowed)
        const finalEndTime = Date.now();
        setEndTimeState(finalEndTime);
        setSessionActive(false); 
        
        // Perform final calculation immediately
        const timeElapsedSeconds = (finalEndTime - startTime) / 1000;
        let finalCorrectChars = 0;
        const finalTypedLength = Math.min(typedText.length, sampleText.length); // Consider only up to sample text length for final accuracy
        for (let i = 0; i < finalTypedLength; i++) {
            if (typedText[i] === sampleText[i]) {
            finalCorrectChars++;
            }
        }
        const finalCharsTyped = typedText.length;
        const finalWordsTyped = typedText.split(' ').filter(Boolean).length;
        const finalCpm = timeElapsedSeconds > 0 ? Math.round((finalCorrectChars / timeElapsedSeconds) * 60) : 0;
        const finalWpm = Math.round(finalCpm / 5) || 0;
        const finalAccuracy = finalCharsTyped > 0 ? Math.round((finalCorrectChars / finalCharsTyped) * 100) : 100;
        const finalErrorCount = errors.length;
        const finalErrorRate = sampleText.length > 0 ? parseFloat(((finalErrorCount / sampleText.length) * 100).toFixed(2)) : 0;

        setStats({
            wpm: finalWpm,
            cpm: finalCpm,
            accuracy: finalAccuracy,
            timeElapsed: parseFloat(timeElapsedSeconds.toFixed(1)),
            errorCount: finalErrorCount,
            wordsTyped: finalWordsTyped,
            charsTyped: finalCharsTyped,
            correctChars: finalCorrectChars,
            errorRate: finalErrorRate,
        });
        return; 
    }

    const intervalId = setInterval(calculateStats, 200); // Update stats more frequently
    
    return () => clearInterval(intervalId);
  }, [sessionActive, startTime, typedText, sampleText, endTime, errors]);

  const handleInputChange = (currentTypedText: string) => {
    if (endTime || !sampleText) return; 

    if (!sessionActive && currentTypedText.length > 0) {
      setSessionActive(true);
      setStartTime(Date.now());
    }
    
    const previousTypedTextLength = typedText.length;
    setTypedText(currentTypedText);

    const currentIndex = currentTypedText.length - 1;
    const isBackspace = currentTypedText.length < previousTypedTextLength;

    if (!isBackspace && currentIndex >= 0 && currentIndex < sampleText.length) {
      const expectedChar = sampleText[currentIndex];
      const typedChar = currentTypedText[currentIndex];
      const isCorrect = typedChar === expectedChar;
      
      const newKeystroke: Keystroke = {
        char: expectedChar, 
        timestamp: Date.now(),
        inputChar: typedChar, 
        status: isCorrect ? 'correct' : 'incorrect',
      };
      
      setKeystrokeHistory(prev => [...prev, newKeystroke]);

      if (!isCorrect) {
        // Add error only if it's a new character being typed, not on backspace
        // And ensure we don't add duplicate errors for the same index if user types multiple wrong chars for same spot
        setErrors(prevErrors => {
          const existingErrorAtPosition = prevErrors.find(err => err.index === currentIndex);
          if (existingErrorAtPosition) { // If error exists, update it
            if (existingErrorAtPosition.actual !== typedChar) {
              return prevErrors.map(err => err.index === currentIndex ? { expected: expectedChar, actual: typedChar, index: currentIndex } : err);
            }
            return prevErrors; // No change if actual char is the same
          }
          return [...prevErrors, { expected: expectedChar, actual: typedChar, index: currentIndex }];
        });
      } else {
        // If typed correctly, remove any existing error at this position
        setErrors(prevErrors => prevErrors.filter(err => err.index !== currentIndex));
      }
    } else if (isBackspace) {
        // When backspacing, we might be "uncovering" a character that was previously typed over.
        // The visual formatting in getFormattedSampleText handles this by re-evaluating against current typedText.
        // We might remove an error if the character *before* the backspaced one was also an error and is now "revealed"
        // but it's simpler to let the stats recalculation handle this.
        // We can remove the error at the new currentTypedText.length if one exists
        setErrors(prevErrors => prevErrors.filter(err => err.index !== currentTypedText.length));
    }
    
    if (currentTypedText.length >= sampleText.length && !endTime) { // Check >=
      setEndTimeState(Date.now());
      setSessionActive(false);
    }
  };
  
  const getFormattedSampleText = useCallback((): FormattedCharacter[] => {
    if (!sampleText) return [];
    return sampleText.split('').map((char, index) => {
      let status: 'correct' | 'incorrect' | 'pending' = 'pending';
      let actualCharValue: string | undefined = undefined;
      
      if (index < typedText.length) {
        status = typedText[index] === char ? 'correct' : 'incorrect';
        if (status === 'incorrect') {
          actualCharValue = typedText[index];
        }
      }
      
      let className = "text-muted-foreground"; 
      if (index === typedText.length && sessionActive && !endTime) {
        className = "text-foreground animate-pulse border-b-2 border-accent";
      } else if (status === 'correct') {
        className = "text-green-600 dark:text-green-400";
      } else if (status === 'incorrect') {
        className = "text-red-600 dark:text-red-500 font-semibold underline decoration-red-600/70 underline-offset-2 cursor-pointer";
      }

      return { 
        char, 
        className, 
        key: `${char}-${index}-${status}-${typedText[index] || 'empty'}`, // Make key more unique for re-renders
        actualChar: actualCharValue,
        originalIndex: index 
      };
    });
  }, [sampleText, typedText, sessionActive, endTime]);


  return {
    sampleText,
    typedText,
    sessionActive,
    stats,
    keystrokeHistory,
    errors,
    inputRef,
    handleInputChange,
    resetTest,
    startTest,
    formattedSampleText: getFormattedSampleText(),
    timeElapsed: stats.timeElapsed,
    isReady: i18nInitialized && sampleText !== "",
    endTime,
  };
}
