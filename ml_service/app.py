from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load model ONCE at startup
logger.info("Loading Sentence-BERT model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
logger.info("Model loaded successfully!")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "model": "all-MiniLM-L6-v2"}), 200

@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.json
        
        if not data:
            return jsonify({"results": [], "error": "No JSON data provided"}), 400
        
        advertiser_text = data.get("advertiser_text", "")
        screens = data.get("screens", [])
        if not advertiser_text:
            return jsonify({"results": [], "error": "advertiser_text is required"}), 400
        
        if not screens or len(screens) == 0:
            return jsonify({"results": [], "error": "screens list is required and cannot be empty"}), 400
        
        logger.info(f"=== RECOMENDATION REQUEST START ===")
        logger.info(f"Advertiser Input Text: {advertiser_text}")
        logger.info(f"Number of screens to recommend from: {len(screens)}")
        
        # Extract screen data
        screen_texts = [s.get("text", "") for s in screens]
        screen_ids = [s.get("id") for s in screens]
        
        # Log first few screens and IDs for debugging
        logger.info(f"Screen IDs (first 5): {screen_ids[:5]}...")
        logger.info(f"Screen Texts (first 2): {screen_texts[:2]}...")

        # Encode texts
        logger.info("Encoding texts...")
        ad_vec = model.encode(advertiser_text)
        screen_vecs = model.encode(screen_texts)
        
        # Compute cosine similarity
        logger.info("Computing cosine similarity...")
        scores = cosine_similarity([ad_vec], screen_vecs)[0]
        
        # Build results
        results = []
        for i in range(len(screen_ids)):
            results.append({
                "screenId": screen_ids[i],
                "score": float(scores[i])
            })  
        
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        
        logger.info(f"Top 3 Recommendations: {results[:3]}")
        logger.info(f"=== RECOMMENDATION REQUEST END ===")
        
        # IMPORTANT: Return wrapped response
        return jsonify({"results": results}), 200
        
    except Exception as e:
        logger.error(f"Error in recommendation: {str(e)}")
        return jsonify({"results": [], "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
