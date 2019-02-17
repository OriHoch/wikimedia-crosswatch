FROM python:2
RUN apt-get update && apt-get install -y git libffi-dev libssl-dev
RUN pip install --upgrade pip
COPY requirements.txt /usr/src/
WORKDIR /usr/src
RUN pip install -r requirements.txt
COPY . /usr/src/
RUN python setup.py install
ENTRYPOINT ["./entrypoint.sh"]
