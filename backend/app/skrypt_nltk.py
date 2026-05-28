import backend.app.skrypt_nltk as skrypt_nltk
from nltk.tokenize import word_tokenize

text = "To jest test rekomendacji filmĂłw po polsku."
try:
    tokens = word_tokenize(text, language="polish")
    print(
        "Tokeny:", tokens
    )
    print("Sukces: Polski jest wspierany!")
except Exception as e:
    print("BĹ‚Ä…d:", str(e))
    import traceback

    traceback.print_exc()
