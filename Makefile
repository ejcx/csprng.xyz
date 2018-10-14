ZONEID=90f1f70c9d65eecd3bcae3a02b4de3e5
ZONENAME=csprng.xyz

deploy:
	cf worker upload-worker --script @csprng.js --zone-id $(ZONEID)

call:
	curl https://$(ZONENAME)/v1/api
