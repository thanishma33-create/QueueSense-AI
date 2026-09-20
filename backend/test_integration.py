import urllib.request
import json
import ssl

BASE = 'http://127.0.0.1:8000/api'

def req(url, method='GET', data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    encoded_data = json.dumps(data).encode('utf-8') if data else None
    request = urllib.request.Request(f'{BASE}{url}', data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as res:
            return res.status, json.loads(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))
    except Exception as e:
        return 500, str(e)

def run_tests():
    print('--- 1. Testing Auth Login ---')
    status, body = req('/auth/login', 'POST', {'email': 'doctor@queuesense.demo', 'password': 'Doctor@123'})
    print('Login Status:', status, 'Role:', body.get('role'), 'Name:', body.get('name'))
    assert status == 200, f'Login failed: {body}'
    token = body['access_token']

    print('\n--- 2. Testing Auth /me ---')
    status, me = req('/auth/me', 'GET', token=token)
    print('Get Me Status:', status, me.get('email'))
    assert status == 200

    print('\n--- 3. Testing Departments ---')
    status, depts = req('/departments', 'GET')
    print('Departments Status:', status, f'Count: {len(depts)}')
    assert status == 200 and len(depts) >= 4

    print('\n--- 4. Testing Patient Registration ---')
    reg_data = {
        'department_id': 1,
        'anonymous_reference': 'TEST-PATIENT-99',
        'anonymized_name': 'Test Integration Patient',
        'age_group': 'Senior Citizen (60+)',
        'visit_type': 'Walk-in OPD',
        'accessibility_needs': ['Malayalam Voice Prompt'],
        'is_priority': True,
        'priority_reason': 'Frail Senior Citizen Assistance',
        'priority_staff_note': 'Test verified by integration suite',
        'priority_verified_by': 'Test Nurse'
    }
    status, new_tok = req('/patients/register', 'POST', reg_data, token=token)
    print('Register Status:', status, 'Token:', new_tok.get('token_number'), 'Status:', new_tok.get('status'))
    assert status == 201

    print('\n--- 5. Testing Queue List & Current ---')
    status, queue = req('/queue/1', 'GET')
    print('Queue dept 1 count:', len(queue))
    assert status == 200

    status, curr = req('/queue/1/current', 'GET')
    print('Current serving token:', curr.get('token_number') if curr else 'None')

    print('\n--- 6. Testing Call Next Patient ---')
    status, called = req('/queue/1/call-next', 'POST', {'counter_number': 1, 'staff_name': 'Dr. Integration'}, token=token)
    print('Call Next Status:', status, 'Token:', called.get('token_number'), 'Status:', called.get('status'))
    assert status == 200
    called_id = called['id']

    print('\n--- 7. Testing Token Status Updates ---')
    status, in_serv = req(f'/queue/tokens/{called_id}/status', 'PATCH', {'status': 'IN_SERVICE', 'counter_number': 1}, token=token)
    print('Status -> IN_SERVICE:', status, in_serv.get('status'))
    assert status == 200 and in_serv.get('status') == 'IN_SERVICE'

    status, comp = req(f'/queue/tokens/{called_id}/status', 'PATCH', {'status': 'COMPLETED', 'service_duration_minutes': 7.5}, token=token)
    print('Status -> COMPLETED:', status, comp.get('status'))
    assert status == 200 and comp.get('status') == 'COMPLETED'

    print('\n--- 8. Testing Waiting Time Estimation AI ---')
    status, wait_est = req('/waiting-time/1', 'GET')
    print('Wait Time Status:', status, f"Est: {wait_est.get('estimated_wait_minutes')} mins, Range: {wait_est.get('range')}")
    assert status == 200

    print('\n--- 9. Testing Priority Flags & Audit ---')
    status, flags = req('/priority/flags', 'GET', token=token)
    print('Priority flags count:', len(flags))
    assert status == 200
    if flags:
        flag_id = flags[0]['id']
        status, updated_flag = req(f'/priority/flags/{flag_id}', 'PATCH', {'status': 'ACCEPTED', 'review_notes': 'Confirmed valid priority'}, token=token)
        print('Reviewed flag status:', status, updated_flag.get('status'))
        assert status == 200

    print('\n--- 10. Testing Analytics Endpoints ---')
    status, analytics = req('/analytics/overview', 'GET')
    print('Analytics Overview Status:', status, 'Completed today:', analytics.get('summary', {}).get('completed_today'))
    assert status == 200

    status, cong = req('/analytics/congestion', 'GET')
    print('Congestion Status:', status, cong.get('overall_congestion_level'))
    assert status == 200

    print('\n=========================================')
    print('ALL 10 BACKEND INTEGRATION TESTS PASSED!')
    print('=========================================')

if __name__ == '__main__':
    run_tests()
