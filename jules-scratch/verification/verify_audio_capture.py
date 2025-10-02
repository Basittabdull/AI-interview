import re
import time
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    """
    This script verifies the "Hold to Speak" functionality in the original UI.
    """
    browser = playwright.chromium.launch(
        headless=True,
        args=[
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
        ]
    )
    context = browser.new_context(
        permissions=["camera", "microphone"]
    )
    page = context.new_page()

    try:
        # 1. Navigate to the app and get to the interview room
        print("Navigating to the application...")
        page.goto("http://localhost:3000", timeout=60000)

        print("Passing Welcome Screen...")
        welcome_heading = page.get_by_text("Welcome to your AI Interview", exact=True)
        expect(welcome_heading).to_be_visible(timeout=10000)
        page.get_by_role("button", name="Start Hardware Check").click()

        print("Passing Hardware Check Screen...")
        hardware_heading = page.get_by_role("heading", name="Hardware Check")
        expect(hardware_heading).to_be_visible()
        page.get_by_role("button", name="Begin Interview").click()

        # 2. Verify the "Hold to Speak" button is ready
        print("Verifying Interview Room...")
        hold_to_speak_button = page.get_by_role("button", name="Hold to Speak")

        # Wait for Eva to finish speaking initially (the button will become enabled)
        expect(hold_to_speak_button).to_be_enabled(timeout=15000)
        print("Button is enabled.")

        # 3. Simulate holding the button to record
        print("Simulating 'Hold to Speak'...")
        hold_to_speak_button.dispatch_event('mousedown')

        # Verify recording state
        expect(page.get_by_role("button", name="Recording...")).to_be_visible()
        time.sleep(2) # Hold for 2 seconds to simulate speaking

        hold_to_speak_button.dispatch_event('mouseup')
        print("Recording sent.")

        # 4. Assert that the transcript appears
        print("Verifying that transcript appears...")
        # The backend sends a simulated transcript
        transcript_text = "This is a simulated transcription of the user's speech."
        transcript_locator = page.get_by_text(transcript_text, exact=True)

        expect(transcript_locator).to_be_visible(timeout=10000)
        print("Transcript verified.")

        # 5. Take final screenshot
        print("Taking screenshot of successful audio capture...")
        page.screenshot(path="jules-scratch/verification/audio_capture_success.png")

        print("Verification script completed successfully!")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as p:
    run_verification(p)