import os
from flask import Flask, render_template, request, jsonify
import backend
from werkzeug.utils import secure_filename
import uuid
import shutil

app = Flask(__name__)

# Configuration
app.config['UPLOAD_FOLDER'] = 'resources'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max upload size
app.config['ALLOWED_EXTENSIONS'] = {'jpg', 'jpeg', 'png', 'gif'}

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/process-images', methods=['POST'])
def process_images():
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400
    
    files = request.files.getlist('images')
    if not files or files[0].filename == '':
        return jsonify({'error': 'No images selected'}), 400
    
    # Create a unique session ID for this batch of uploads
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    try:
        # Save uploaded files
        image_urls = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(session_dir, filename)
                file.save(file_path)
                
                # Use file URLs for local processing
                # In production, you might need to use real URLs or file paths
                image_urls.append(f"file://{os.path.abspath(file_path)}")
        
        if not image_urls:
            return jsonify({'error': 'No valid images uploaded'}), 400

        # Get the selected model choice from the form data
        selected_model = request.form.get('modelChoice', 'Model1') # Default to Model1
        
        # Process images using the backend module, passing the model choice
        result = backend.generate(image_urls, selected_model)
        
        # Clean up - remove the session directory after processing
        shutil.rmtree(session_dir, ignore_errors=True)
        
        return jsonify(result)
    
    except Exception as e:
        # Clean up in case of error
        shutil.rmtree(session_dir, ignore_errors=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
