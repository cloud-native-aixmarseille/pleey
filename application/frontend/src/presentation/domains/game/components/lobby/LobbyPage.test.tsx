import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import LobbyPage from "./LobbyPage";

describe("LobbyPage", () => {
  const mockPlayers = [
    { id: 1, username: "Player1", avatar: "/api/avatars/sessions/1/user-1" },
    { id: 2, username: "Player2", avatar: "/api/avatars/sessions/1/user-2" },
  ];

  it("should render lobby page with PIN", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isHost: false,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.getByText(/GAME LOBBY/i)).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: /Enter PIN:\s*123456/i })
    ).toBeInTheDocument();
  });

  it("should display number of connected players", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isHost: false,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    const playerCountElements = screen.getAllByText(/Connected Players/i);
    expect(playerCountElements.length).toBeGreaterThan(0);
  });

  it("should display player list", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isHost: false,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.getByText("Player1")).toBeInTheDocument();
    expect(screen.getByText("Player2")).toBeInTheDocument();
  });

  it("should highlight the current player when username provided", () => {
    render(
      <LobbyPage
        gamePin="123456"
        players={mockPlayers}
        isHost={false}
        currentPlayerUsername="Player2"
        onStartGame={vi.fn()}
        questionCount={2}
      />
    );

    const highlighted = document.querySelector('[data-current-player="true"]');
    expect(highlighted).toBeTruthy();
    expect(
      within(highlighted as HTMLElement).getByText("Player2")
    ).toBeInTheDocument();

    const player2Occurrences = screen.getAllByText("Player2");
    expect(player2Occurrences).toHaveLength(1);
  });

  it("should display quiz title when provided", () => {
    render(
      <LobbyPage
        gamePin="123456"
        players={mockPlayers}
        isHost={false}
        quizTitle="My Awesome Quiz"
        onStartGame={vi.fn()}
        questionCount={2}
      />
    );

    expect(screen.getByTestId("lobby-quiz-title")).toHaveTextContent(
      "My Awesome Quiz"
    );
  });

  it("should render back button for non-host players when handler provided", () => {
    const onBack = vi.fn();

    render(
      <LobbyPage
        gamePin="123456"
        players={mockPlayers}
        isHost={false}
        onStartGame={vi.fn()}
        onBack={onBack}
        questionCount={2}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /BACK/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("should show start button only for host", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isHost: true,
      hostUserId: null,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(
      screen.getByRole("button", { name: /START GAME/i })
    ).toBeInTheDocument();
  });

  it("should not show start button for non-host", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isHost: false,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(
      screen.queryByRole("button", { name: /START GAME/i })
    ).not.toBeInTheDocument();
  });

  it("should exclude host from player list", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isHost: true,
      hostUserId: 1,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    expect(screen.queryByText("Player1")).not.toBeInTheDocument();
    expect(screen.getByText("Player2")).toBeInTheDocument();
  });

  it("should exclude host using username when id is unavailable", () => {
    const playersMissingId = [
      {
        id: undefined as unknown as number,
        username: "HostUser",
        avatar: "/api/avatars/sessions/2/user-host",
      },
      {
        id: 2 as unknown as number,
        username: "GuestPlayer",
        avatar: "/api/avatars/sessions/2/guest-1",
      },
    ];

    render(
      <LobbyPage
        gamePin="654321"
        players={playersMissingId}
        isHost
        hostUserId={null}
        hostUsername="HostUser"
        onStartGame={vi.fn()}
        questionCount={2}
      />
    );

    expect(screen.queryByText("HostUser")).not.toBeInTheDocument();
    expect(screen.getByText("GuestPlayer")).toBeInTheDocument();
  });

  it("should exclude host when player id uses username value", () => {
    const playersWithNamedId = [
      {
        id: "host" as unknown as number,
        username: "host",
        avatar: "/api/avatars/sessions/3/user-host",
      },
      {
        id: "player-1" as unknown as number,
        username: "PlayerOne",
        avatar: "/api/avatars/sessions/3/guest-1",
      },
    ];

    render(
      <LobbyPage
        gamePin="222333"
        players={playersWithNamedId}
        isHost
        hostUserId={1}
        hostUsername="Host"
        onStartGame={vi.fn()}
        questionCount={3}
      />
    );

    expect(screen.queryByText("host")).not.toBeInTheDocument();
    expect(screen.getByText("PlayerOne")).toBeInTheDocument();
  });

  it("should call onStartGame when host clicks start button", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isHost: true,
      onStartGame: vi.fn(),
      questionCount: 2,
    };

    render(<LobbyPage {...mockHandlers} />);

    const startButton = screen.getByRole("button", { name: /START GAME/i });
    fireEvent.click(startButton);

    expect(mockHandlers.onStartGame).toHaveBeenCalled();
  });

  it("should show stop session button only for host when handler provided", () => {
    const stopSession = vi.fn();

    const { rerender } = render(
      <LobbyPage
        gamePin="123456"
        players={mockPlayers}
        isHost
        onStartGame={vi.fn()}
        onStopSession={stopSession}
        questionCount={2}
      />
    );

    expect(
      screen.getByRole("button", { name: /STOP SESSION/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /STOP SESSION/i }));
    expect(stopSession).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /stop session/i })
    );
    expect(stopSession).toHaveBeenCalled();

    rerender(
      <LobbyPage
        gamePin="123456"
        players={mockPlayers}
        isHost={false}
        onStartGame={vi.fn()}
        onStopSession={stopSession}
        questionCount={2}
      />
    );

    expect(
      screen.queryByRole("button", { name: /STOP SESSION/i })
    ).not.toBeInTheDocument();
  });

  it("should disable start button when quiz has no questions", () => {
    const mockHandlers = {
      gamePin: "123456",
      players: mockPlayers,
      isHost: true,
      onStartGame: vi.fn(),
      questionCount: 0,
    };

    render(<LobbyPage {...mockHandlers} />);

    const startButton = screen.getByRole("button", { name: /START GAME/i });
    expect(startButton).toBeDisabled();
  });

  it("should render paused overlay when session is paused", () => {
    render(
      <LobbyPage
        gamePin="123456"
        players={mockPlayers}
        isHost={false}
        isPaused
        onStartGame={vi.fn()}
        questionCount={2}
      />
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("should not render paused overlay for the host", () => {
    const onTogglePause = vi.fn();

    render(
      <LobbyPage
        gamePin="123456"
        players={mockPlayers}
        isHost
        isPaused
        onTogglePause={onTogglePause}
        onStartGame={vi.fn()}
        questionCount={2}
      />
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("paused-host-banner")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /resume/i }));
    expect(onTogglePause).toHaveBeenCalledTimes(1);
  });
});
