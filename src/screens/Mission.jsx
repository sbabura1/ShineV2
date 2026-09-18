import { ArrowLeft, ArrowRight, CircleHelp } from 'lucide-react';
import { missionSteps } from '../data';
import Button from '../components/ui/Button';
import ChoiceStep from '../components/mission/ChoiceStep';
import DataTable from '../components/mission/DataTable';

const signalOptions = [
  'West district has a much higher rate than the others.',
  'East district has the fewest calls.',
  'North district has more arrests than South.',
];

const evidenceOptions = [
  'Use the West rate immediately; the difference is obvious.',
  'Check the outlier, duplicate, and category mismatch before comparing.',
  'Remove the West row because it is probably wrong.',
];

const decisionOptions = [
  'Deploy targeted resources to West while validating the 510-call outlier.',
  'Treat all districts equally until every row is perfect.',
  'Focus only on East because its arrest field is missing.',
];

const confidenceLevels = ['Low', 'Developing', 'Ready', 'Strong', 'Expert'];

function BriefingStep() {
  return (
    <div className="briefing">
      <span className="brief-number">01</span>
      <div>
        <span className="eyebrow">Briefing</span>
        <h2>Find the story the average is hiding.</h2>
        <p>You are reviewing six weeks of incident data across four districts. The chief wants to know where a targeted response could make the biggest difference. Start by checking whether the data deserves your trust.</p>
        <div className="callout"><CircleHelp size={18} /><span>Strong analysts do not rush to the answer. They first ask what could make the answer misleading.</span></div>
      </div>
    </div>
  );
}

function AssessmentStep({ selected, setSelected }) {
  return (
    <div className="assessment-step">
      <span className="eyebrow">Assessment</span>
      <h2>One last confidence check</h2>
      <p>How confident are you in the recommendation you would present?</p>
      <div className="confidence-row">
        {confidenceLevels.map((label) => <button className={selected === label ? 'selected' : ''} onClick={() => setSelected(label)} key={label}>{label}</button>)}
      </div>
    </div>
  );
}

function CompleteStep({ onFinish }) {
  return (
    <div className="complete-step">
      <span className="complete-mark">&#10003;</span>
      <span className="eyebrow">Debrief complete</span>
      <h2>Evidence before certainty.</h2>
      <p>You identified the signal, challenged data quality, and made a measured recommendation. That is the work.</p>
      <Button onClick={onFinish}>View updated identity <ArrowRight size={17} /></Button>
    </div>
  );
}

export default function Mission({ sector, step, setStep, selected, setSelected, onFinish }) {
  return (
    <main className="page mission-page">
      <button className="back-link" onClick={() => setStep(Math.max(0, step - 1))}><ArrowLeft size={15} /> Back</button>
      <div className="mission-header">
        <div><span className="eyebrow">{sector.name} &middot; Case file 01</span><h1>Signal in the noise</h1><p>District vehicle theft has shifted. Your team needs a defensible read before resources move.</p></div>
        <span className="mission-badge">Mission 01 / 07</span>
      </div>
      <div className="stepper">
        {missionSteps.map((label, index) => <button className={`${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`} onClick={() => setStep(index)} key={label}><span>{String(index + 1).padStart(2, '0')}</span>{label}</button>)}
      </div>
      <section className="mission-card">
        {step === 0 && <BriefingStep />}
        {step === 1 && <DataTable />}
        {step === 2 && <ChoiceStep title="Find the signal" copy="Which observation should you investigate first?" options={signalOptions} selected={selected} setSelected={setSelected} />}
        {step === 3 && <ChoiceStep title="Build the evidence" copy="What is the strongest next move?" options={evidenceOptions} selected={selected} setSelected={setSelected} />}
        {step === 4 && <ChoiceStep title="Make the call" copy="Choose the recommendation you can defend." options={decisionOptions} selected={selected} setSelected={setSelected} />}
        {step === 5 && <AssessmentStep selected={selected} setSelected={setSelected} />}
        {step === 6 && <CompleteStep onFinish={onFinish} />}
        <div className="mission-actions">
          {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Previous</Button>}
          {step < 6 && <Button onClick={() => setStep(step + 1)}>{step === 5 ? 'Complete mission' : 'Next step'} <ArrowRight size={16} /></Button>}
        </div>
      </section>
    </main>
  );
}
