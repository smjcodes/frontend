'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingState from '@/components/LoadingState';
import { canParticipateInContest, getToken, getUser, subscribeToAuthChanges } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import type {
  ContestDetail,
  HistoryEntry,
  Participation,
  SubmitContestPayload,
  User,
} from '@/lib/types';
import { getContestById, joinContest, submitContest } from '@/services/contest.service';
import { getHistory } from '@/services/user.service';

type ContestDetailPageProps = {
  params: {
    id: string;
  };
};

type AnswerMap = Record<string, string[]>;

const findParticipationForContest = (history: HistoryEntry[], contestId: string) =>
  history.find((entry) => entry.contest?.id === contestId) || null;

export default function ContestDetailPage({ params }: ContestDetailPageProps) {
  const contestId = params.id;
  const [contest, setContest] = useState<ContestDetail | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const canJoinOrSubmit = contest ? canParticipateInContest(user, contest) : false;

  const selectedAnswerCount = useMemo(
    () => Object.values(answers).filter((selected) => selected.length > 0).length,
    [answers]
  );

  useEffect(() => {
    const syncUser = () => setUser(getUser());

    syncUser();

    const loadContest = async () => {
      setLoading(true);
      setError(null);

      try {
        const contestDetail = await getContestById(contestId);
        setContest(contestDetail);

        const token = getToken();
        const currentUser = getUser();

        if (token && currentUser) {
          const history = await getHistory(token);
          const existingParticipation = findParticipationForContest(history, contestId);

          if (existingParticipation) {
            setParticipation(existingParticipation);
            setScore(existingParticipation.status === 'SUBMITTED' ? existingParticipation.score : null);
          } else {
            setParticipation(null);
            setScore(null);
          }
        } else {
          setParticipation(null);
          setScore(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contest.');
      } finally {
        setLoading(false);
      }
    };

    void loadContest();
    return subscribeToAuthChanges(syncUser);
  }, [contestId]);

  const updateSingleAnswer = (questionId: string, optionId: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: [optionId],
    }));
  };

  const updateMultiAnswer = (questionId: string, optionId: string, checked: boolean) => {
    setAnswers((current) => {
      const existing = current[questionId] || [];

      return {
        ...current,
        [questionId]: checked
          ? [...new Set([...existing, optionId])]
          : existing.filter((value) => value !== optionId),
      };
    });
  };

  const handleJoin = async () => {
    const token = getToken();

    if (!token) {
      setError('You must log in before joining a contest.');
      return;
    }

    setJoinLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await joinContest(contestId, token);
      setParticipation(response.participation);
      setSuccess('Contest joined. You can now answer and submit.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Join request failed.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleSubmit = async () => {
    const token = getToken();

    if (!token) {
      setError('You must log in before submitting.');
      return;
    }

    const payload: SubmitContestPayload = {
      answers: Object.entries(answers)
        .filter(([, selectedOptionIds]) => selectedOptionIds.length > 0)
        .map(([questionId, selectedOptionIds]) => ({
          questionId,
          selectedOptionIds,
        })),
    };

    if (payload.answers.length === 0) {
      setError('Select at least one answer before submitting.');
      return;
    }

    setSubmitLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await submitContest(contestId, payload, token);
      setParticipation(response.participation);
      setScore(response.score);
      setSuccess(`Contest submitted successfully. Final score: ${response.score}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit request failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading contest detail..." />;
  }

  if (!contest) {
    return (
      <section className="page">
        <ErrorMessage message={error || 'Contest not found.'} />
      </section>
    );
  }

  return (
    <section className="page">
      <div className="card stack">
        <div className="row">
          <h1>{contest.title}</h1>
          <span className={`badge ${contest.accessLevel === 'VIP' ? 'badge-vip' : 'badge-normal'}`}>
            {contest.accessLevel}
          </span>
        </div>

        <p>{contest.description}</p>

        <dl className="meta-grid">
          <div>
            <dt>Prize</dt>
            <dd>{contest.prizeInfo || '-'}</dd>
          </div>
          <div>
            <dt>Start</dt>
            <dd>{formatDateTime(contest.startTime)}</dd>
          </div>
          <div>
            <dt>End</dt>
            <dd>{formatDateTime(contest.endTime)}</dd>
          </div>
          <div>
            <dt>Active</dt>
            <dd>{contest.isActive ? 'Yes' : 'No'}</dd>
          </div>
        </dl>

        <div className="actions">
          <Link className="button secondary" href={`/contests/${contest.id}/leaderboard`}>
            View Leaderboard
          </Link>

          {!user ? (
            <span className="muted">Login required to join or submit.</span>
          ) : !canJoinOrSubmit ? (
            <span className="muted">This contest is restricted to VIP users.</span>
          ) : !participation ? (
            <button className="button" disabled={joinLoading} onClick={() => void handleJoin()} type="button">
              {joinLoading ? 'Joining...' : 'Join Contest'}
            </button>
          ) : (
            <span className="muted">Participation status: {participation.status}</span>
          )}
        </div>

        <ErrorMessage message={error} />
        {success ? <div className="alert alert-success">{success}</div> : null}
      </div>

      <div className="card stack">
        <h2>Questions</h2>
        <p className="muted">
          The frontend never receives correct-answer flags. Only option text and IDs are rendered.
        </p>
      </div>

      <div className="grid">
        {contest.questions.map((question, index) => (
          <div className="card question-card" key={question.id}>
            <div className="stack">
              <h3>
                Q{index + 1}. {question.text}
              </h3>
              <p className="small muted">
                Type: {question.questionType} | Points: {question.points}
              </p>
            </div>

            <fieldset disabled={participation?.status === 'SUBMITTED' || !participation}>
              <legend>Select option(s)</legend>
              {question.options.map((option) => {
                const isMulti = question.questionType === 'MULTI_SELECT';
                const selected = answers[question.id] || [];

                return (
                  <label className="option-row" key={option.id}>
                    <input
                      checked={selected.includes(option.id)}
                      name={question.id}
                      onChange={(event) => {
                        if (isMulti) {
                          updateMultiAnswer(question.id, option.id, event.target.checked);
                          return;
                        }

                        updateSingleAnswer(question.id, option.id);
                      }}
                      type={isMulti ? 'checkbox' : 'radio'}
                    />
                    <span>{option.text}</span>
                  </label>
                );
              })}
            </fieldset>
          </div>
        ))}
      </div>

      <div className="card stack">
        <div className="row">
          <div>
            <h2>Submit Contest</h2>
            <p className="muted">
              Selected questions ready to submit: {selectedAnswerCount} / {contest.questions.length}
            </p>
          </div>
          {score !== null ? <div className="badge badge-normal">Score: {score}</div> : null}
        </div>

        {participation?.status === 'IN_PROGRESS' && canJoinOrSubmit ? (
          <div className="actions">
            <button
              className="button"
              disabled={submitLoading}
              onClick={() => void handleSubmit()}
              type="button"
            >
              {submitLoading ? 'Submitting...' : 'Submit Answers'}
            </button>
            <span className="muted small">
              The backend accepts the selected answers and calculates the final score.
            </span>
          </div>
        ) : null}

        {participation?.status === 'SUBMITTED' ? (
          <div className="alert alert-success">
            Contest already submitted. Final score: {score ?? participation.score}
          </div>
        ) : null}
      </div>
    </section>
  );
}
