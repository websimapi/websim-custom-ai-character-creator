document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    
    const characterDescription = document.getElementById('characterDescription');
    const generateImageBtn = document.getElementById('generateImageBtn');
    const imageGenerationLoading = document.getElementById('imageGenerationLoading');
    const imagePreview = document.getElementById('imagePreview');
    const characterImage = document.getElementById('characterImage');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const confirmImageBtn = document.getElementById('confirmImageBtn');
    
    const voiceSample = document.getElementById('voiceSample');
    const generateVoiceBtn = document.getElementById('generateVoiceBtn');
    const voiceGenerationLoading = document.getElementById('voiceGenerationLoading');
    const voicePreview = document.getElementById('voicePreview');
    const characterVoice = document.getElementById('characterVoice');
    const regenerateVoiceBtn = document.getElementById('regenerateVoiceBtn');
    const confirmVoiceBtn = document.getElementById('confirmVoiceBtn');
    
    const finalCharacter = document.getElementById('finalCharacter');
    const userMessage = document.getElementById('userMessage');
    const speakBtn = document.getElementById('speakBtn');
    
    // Store character data
    let characterData = {
        imageUrl: null,
        processedImageUrl: null,
        voiceUrl: null
    };
    
    // Event listeners
    generateImageBtn.addEventListener('click', generateCharacterImage);
    regenerateBtn.addEventListener('click', generateCharacterImage);
    confirmImageBtn.addEventListener('click', () => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    });
    
    generateVoiceBtn.addEventListener('click', generateCharacterVoice);
    regenerateVoiceBtn.addEventListener('click', generateCharacterVoice);
    confirmVoiceBtn.addEventListener('click', () => {
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
        finalCharacter.src = characterData.processedImageUrl;
    });
    
    speakBtn.addEventListener('click', makeCharacterSpeak);
    
    // Generate character image
    async function generateCharacterImage() {
        if (!characterDescription.value.trim()) {
            alert('Please describe your character first!');
            return;
        }
        
        // Show loading
        imageGenerationLoading.classList.remove('hidden');
        imagePreview.classList.add('hidden');
        
        try {
            // Generate image with white background requirement
            const prompt = `${characterDescription.value.trim()}. Character centered on pure white background. No text, no watermarks.`;
            
            const result = await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "1:1",
            });
            
            characterData.imageUrl = result.url;
            
            // Process image to remove background
            await processImage(result.url);
            
            // Show image preview
            imageGenerationLoading.classList.add('hidden');
            imagePreview.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Failed to generate character image. Please try again.');
            imageGenerationLoading.classList.add('hidden');
        }
    }
    
    // Process image to make background transparent
    async function processImage(imageUrl) {
        // Create an image element to load the generated image
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Define white threshold (close to white)
            const threshold = 240;
            
            // Make white background transparent
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // If pixel is close to white, make it transparent
                if (r >= threshold && g >= threshold && b >= threshold) {
                    data[i + 3] = 0; // Alpha = 0 (transparent)
                }
            }
            
            // Put modified image data back to canvas
            ctx.putImageData(imageData, 0, 0);
            
            // Save processed image
            characterData.processedImageUrl = canvas.toDataURL('image/png');
            characterImage.src = characterData.processedImageUrl;
        };
        
        img.onerror = function() {
            console.error('Error loading image for processing');
            characterImage.src = imageUrl; // Fallback to original image
            characterData.processedImageUrl = imageUrl;
        };
        
        img.src = imageUrl;
    }
    
    // Generate character voice
    async function generateCharacterVoice() {
        if (!voiceSample.value.trim()) {
            alert('Please enter a voice sample first!');
            return;
        }
        
        // Show loading
        voiceGenerationLoading.classList.remove('hidden');
        voicePreview.classList.add('hidden');
        
        try {
            // Choose random voice type for variation
            const voices = ['en-male', 'en-female'];
            const randomVoice = voices[Math.floor(Math.random() * voices.length)];
            
            const result = await websim.textToSpeech({
                text: voiceSample.value.trim(),
                voice: randomVoice,
            });
            
            characterData.voiceUrl = result.url;
            
            // Show voice preview
            characterVoice.src = characterData.voiceUrl;
            voiceGenerationLoading.classList.add('hidden');
            voicePreview.classList.remove('hidden');
            
            // Add event listeners for audio play/end to trigger bounce animation
            characterVoice.onplay = function() {
                characterImage.classList.add('bounce');
            };
            
            characterVoice.onended = function() {
                characterImage.classList.remove('bounce');
            };
            
        } catch (error) {
            console.error('Error generating voice:', error);
            alert('Failed to generate character voice. Please try again.');
            voiceGenerationLoading.classList.add('hidden');
        }
    }
    
    // Make character speak
    async function makeCharacterSpeak() {
        if (!userMessage.value.trim()) {
            alert('Please enter a message for your character to say!');
            return;
        }
        
        try {
            // Generate speech for the message
            const result = await websim.textToSpeech({
                text: userMessage.value.trim(),
                voice: 'en-female', // Use the same voice type as before
            });
            
            // Create audio element
            const audio = new Audio(result.url);
            
            // Add bounce animation to character
            finalCharacter.classList.add('bounce');
            
            // Play audio
            audio.play();
            
            // Reset animation when audio ends
            audio.onended = function() {
                finalCharacter.classList.remove('bounce');
            };
            
            // Reset input field
            userMessage.value = '';
            
        } catch (error) {
            console.error('Error making character speak:', error);
            alert('Failed to make character speak. Please try again.');
        }
    }
});