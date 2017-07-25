from flask import Flask
from flask import render_template, Response, request
from datetime import datetime
import lightcurve
from dateutil import parser
from dateutil import relativedelta

app = Flask(__name__)


def _make_response_for_invalid_request(message):
    return Response(
                response=message,
                status=400,
                mimetype='application/json'
            )


@app.route('/v1/excess', methods=['GET'])
def rta():
    args = request.args

    try:
        d = args.get('start_date', None)
        if d:
            start_date = parser.parse(d, fuzzy=True).isoformat()
        else:
            start_date = (datetime.now() - relativedelta(hours=12)).isoformat()

    except ValueError:
        return _make_response_for_invalid_request('Could not parse start date')

    try:
        latest_date = parser.parse(args.get('latest_date', datetime.now().isoformat()), fuzzy=True)
        latest_date = latest_date.isoformat()
    except ValueError:
        return _make_response_for_invalid_request('Could not parse latest date')

    try:
        bin_width = int(args.get('bin_width', 20))
    except ValueError:
        return _make_response_for_invalid_request('Could not parse bin width')

    source = args.get('source', None)

    print(start_date)
    runs, events = lightcurve.fetch_data(start=start_date, end=latest_date, source=source)
    if len(runs) == 0:
        return Response(
                    response='[]',
                    status=200,
                    mimetype="application/json"
                )

    excess = lightcurve.excess(runs, events, bin_width_minutes=bin_width)
    excess = excess.drop(['run_start', 'run_stop', 'night'], axis=1)
    excess['bin_start'] = excess.time_mean - excess.time_width * 0.5
    excess['bin_end'] = excess.time_mean + excess.time_width * 0.5
    excess = excess.drop(['time_mean', 'time_width'], axis=1)
    resp = Response(
                    response=excess.to_json(orient='records', date_format='iso'),
                    status=200,
                    mimetype="application/json"
            )
    return resp


@app.route('/')
def hello():
    title = 'FACT Real Time Analysis'
    return render_template('index.html', title=title)
