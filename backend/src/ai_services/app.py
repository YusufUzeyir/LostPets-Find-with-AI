from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from transformers import BeitForImageClassification, BeitFeatureExtractor
import torch
import os
import traceback
import sys

app = Flask(__name__)
CORS(app)

# Model yükleme işlemlerini try-except bloğuna alalım
try:
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Kullanılan cihaz: {device}")

    # Model dosyalarının varlığını kontrol et
    required_files = ["AnimalsBeit_weights.pth", "CatsBeit_weights.pth", "DogsBeit_weights.pth"]
    for file in required_files:
        if not os.path.exists(file):
            print(f"HATA: {file} bulunamadı!")
            sys.exit(1)

    # Ana model yükleme
    print("Ana model yükleniyor...")
    main_model_path = "AnimalsBeit_weights.pth"
    main_model_name = "microsoft/beit-base-patch16-224-pt22k-ft22k"
    main_model = BeitForImageClassification.from_pretrained(
        main_model_name,
        num_labels=2,
        ignore_mismatched_sizes=True
    )
    main_model.classifier = torch.nn.Linear(main_model.config.hidden_size, 2)
    main_model.load_state_dict(torch.load(main_model_path, map_location=device))
    main_model.to(device)
    main_model.eval()
    main_feature_extractor = BeitFeatureExtractor.from_pretrained(main_model_name)
    main_class_labels = ["Cat", "Dog"]
    print("Ana model başarıyla yüklendi")

    # Kedi modeli yükleme
    print("Kedi modeli yükleniyor...")
    cat_model_path = "CatsBeit_weights.pth"
    cat_model = BeitForImageClassification.from_pretrained(
        main_model_name,
        num_labels=8,
        ignore_mismatched_sizes=True
    )
    cat_model.classifier = torch.nn.Linear(cat_model.config.hidden_size, 8)
    cat_model.load_state_dict(torch.load(cat_model_path, map_location=device))
    cat_model.to(device)
    cat_model.eval()
    cat_class_labels = ["Bengal", "British Shorthair", "İran kedisi", "Mısır mausu", "Scottish fold", "Sfenks", "Siyam", "Tekir"]
    print("Kedi modeli başarıyla yüklendi")

    # Köpek modeli yükleme
    print("Köpek modeli yükleniyor...")
    dog_model_path = "DogsBeit_weights.pth"
    dog_model = BeitForImageClassification.from_pretrained(
        main_model_name,
        num_labels=8,
        ignore_mismatched_sizes=True
    )
    dog_model.classifier = torch.nn.Linear(dog_model.config.hidden_size, 8)
    dog_model.load_state_dict(torch.load(dog_model_path, map_location=device))
    dog_model.to(device)
    dog_model.eval()
    dog_class_labels = ["Chihuahua", "Doberman", "French Bulldog", "Golden Retriever", "Labrador Retriever", "Pug", "Rottweiler", "Siberian Husky"]
    print("Köpek modeli başarıyla yüklendi")

except Exception as e:
    print(f"Model yükleme hatası: {str(e)}")
    print("Hata detayı:")
    print(traceback.format_exc())
    sys.exit(1)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("Yeni tahmin isteği alındı")
        
        if 'image' not in request.files:
            print("Hata: Resim dosyası bulunamadı")
            return jsonify({"error": "Resim yüklenmedi"}), 400

        image_file = request.files['image']
        print(f"Alınan dosya adı: {image_file.filename}")
        
        if not image_file.filename:
            print("Hata: Geçersiz dosya adı")
            return jsonify({"error": "Geçersiz dosya"}), 400

        # Görüntüyü açma ve işleme
        print("Görüntü işleniyor...")
        image = Image.open(image_file).convert("RGB")
        inputs = main_feature_extractor(images=image, return_tensors="pt")
        pixel_values = inputs['pixel_values'].to(device)

        # Ana model tahmini
        print("Ana model tahmini yapılıyor...")
        with torch.no_grad():
            outputs = main_model(pixel_values)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            confidence, predicted_class = torch.max(probs, dim=-1)

            # Tüm sınıflar için olasılıkları hesapla
            main_predictions = []
            for i, prob in enumerate(probs[0]):
                main_predictions.append({
                    "class": main_class_labels[i],
                    "probability": f"{prob.item() * 100:.2f}%"
                })

        main_result = {
            "class": main_class_labels[predicted_class.item()],
            "confidence": f"{confidence.item() * 100:.2f}%",
            "all_main_predictions": main_predictions
        }
        print(f"Ana model sonucu: {main_result}")

        # Alt model seçimi ve tahmini
        if main_result["class"] == "Cat":
            print("Kedi modeli kullanılıyor...")
            model = cat_model
            labels = cat_class_labels
        elif main_result["class"] == "Dog":
            print("Köpek modeli kullanılıyor...")
            model = dog_model
            labels = dog_class_labels
        else:
            print(f"Hata: Bilinmeyen sınıf - {main_result['class']}")
            return jsonify({"error": "Bilinmeyen hayvan türü"}), 500

        print("Alt model tahmini yapılıyor...")
        with torch.no_grad():
            outputs = model(pixel_values)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            confidence, predicted_class = torch.max(probs, dim=-1)

            # Tüm ırklar için olasılıkları hesapla
            breed_predictions = []
            for i, prob in enumerate(probs[0]):
                breed_predictions.append({
                    "breed": labels[i],
                    "probability": f"{prob.item() * 100:.2f}%"
                })

        detailed_result = {
            "subclass": labels[predicted_class.item()],
            "subclass_confidence": f"{confidence.item() * 100:.2f}%",
            "all_predictions": sorted(breed_predictions, key=lambda x: float(x["probability"].rstrip('%')), reverse=True)
        }
        print(f"Alt model sonucu: {detailed_result}")

        result = {**main_result, **detailed_result}
        print(f"Gönderilen sonuç: {result}")
        return jsonify(result)

    except Exception as e:
        error_detail = traceback.format_exc()
        print(f"Hata oluştu: {str(e)}")
        print("Hata detayı:")
        print(error_detail)
        return jsonify({
            "error": "Görüntü işlenirken bir hata oluştu",
            "detail": str(e),
            "trace": error_detail
        }), 500

if __name__ == '__main__':
    print("Flask uygulaması başlatılıyor...")
    app.run(debug=True, host='0.0.0.0', port=5001)